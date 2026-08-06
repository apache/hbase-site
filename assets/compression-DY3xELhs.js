import{j as e}from"./components-BCHf_v1I.js";import{_ as o,a as t,b as r}from"./data_block_diff_encoding-DaVDpSR3.js";let d=`





<Callout type="info">
  Codecs mentioned in this section are for encoding and decoding data blocks or row keys. For
  information about replication codecs, see
  [cluster.replication.preserving.tags](/docs/operational-management/cluster-replication#life-of-a-wal-edit).
</Callout>

HBase supports several different compression algorithms which can be enabled on a ColumnFamily.
Data block encoding attempts to limit duplication of information in keys, taking advantage of some of the fundamental designs and patterns of HBase, such as sorted row keys and the schema of a given table.
Compressors reduce the size of large, opaque byte arrays in cells, and can significantly reduce the storage space needed to store uncompressed data.

Compressors and data block encoding can be used together on the same ColumnFamily.

## Changes Take Effect Upon Compaction

If you change compression or encoding for a ColumnFamily, the changes take effect during compaction.

Some codecs take advantage of capabilities built into Java, such as GZip compression.
Others rely on native libraries. Native libraries may be available via codec dependencies installed into
HBase's library directory, or, if you are utilizing Hadoop codecs, as part of Hadoop. Hadoop codecs
typically have a native code component so follow instructions for installing Hadoop native binary
support at [Making use of Hadoop Native Libraries in HBase](/docs/compression#making-use-of-hadoop-native-libraries-in-hbase).

This section discusses common codecs that are used and tested with HBase.

No matter what codec you use, be sure to test that it is installed correctly and is available on all nodes in your cluster.
Extra operational steps may be necessary to be sure that codecs are available on newly-deployed nodes.
You can use the [compression.test](/docs/compression#compressiontest) utility to check that a given codec is correctly installed.

To configure HBase to use a compressor, see [compressor.install](/docs/compression#compressor-configuration-installation-and-use).
To enable a compressor for a ColumnFamily, see [changing.compression](/docs/compression#enable-compression-on-a-columnfamily).
To enable data block encoding for a ColumnFamily, see [data.block.encoding.enable](/docs/compression#enable-data-block-encoding).

## Block Compressors

* **NONE**\\
  This compression type constant selects no compression, and is the default.
* **BROTLI**\\
  [Brotli](https://en.wikipedia.org/wiki/Brotli) is a generic-purpose lossless compression algorithm
  that compresses data using a combination of a modern variant of the LZ77 algorithm, Huffman
  coding, and 2nd order context modeling, with a compression ratio comparable to the best currently
  available general-purpose compression methods. It is similar in speed with GZ but offers more
  dense compression.
* **BZIP2**\\
  [Bzip2](https://en.wikipedia.org/wiki/Bzip2) compresses files using the Burrows-Wheeler block
  sorting text compression algorithm and Huffman coding. Compression is generally considerably
  better than that achieved by the dictionary- (LZ-) based compressors, but both compression and
  decompression can be slow in comparison to other options.
* **GZ**\\
  gzip is based on the [DEFLATE](https://en.wikipedia.org/wiki/Deflate) algorithm, which is a
  combination of LZ77 and Huffman coding. It is universally available in the Java Runtime
  Environment so is a good lowest common denominator option. However in comparison to more modern
  algorithms like Zstandard it is quite slow.
* **LZ4**\\
  [LZ4](https://en.wikipedia.org/wiki/LZ4_\\(compression_algorithm\\)) is a lossless data compression
  algorithm that is focused on compression and decompression speed. It belongs to the LZ77 family
  of compression algorithms, like Brotli, DEFLATE, Zstandard, and others. In our microbenchmarks
  LZ4 is the fastest option for both compression and decompression in that family, and is our
  universally recommended option.
* **LZMA**\\
  [LZMA](https://en.wikipedia.org/wiki/Lempel%E2%80%93Ziv%E2%80%93Markov_chain_algorithm) is a
  dictionary compression scheme somewhat similar to the LZ77 algorithm that achieves very high
  compression ratios with a computationally expensive predictive model and variable size
  compression dictionary, while still maintaining decompression speed similar to other commonly used
  compression algorithms. LZMA is superior to all other options in general compression ratio but as
  a compressor it can be extremely slow, especially when configured to operate at higher levels of
  compression.
* **LZO**\\
  [LZO](https://en.wikipedia.org/wiki/Lempel%E2%80%93Ziv%E2%80%93Oberhumer) is another LZ-variant
  data compression algorithm, with an implementation focused on decompression speed. It is almost
  but not quite as fast as LZ4.
* **SNAPPY**\\
  [Snappy](https://en.wikipedia.org/wiki/Snappy_\\(compression\\)) is based on ideas from LZ77 but is
  optimized for very high compression speed, achieving only a "reasonable" compression in trade.
  It is as fast as LZ4 but does not compress quite as well. We offer a pure Java Snappy codec
  that can be used instead of GZ as the universally available option for any Java runtime on any
  hardware architecture.
* **ZSTD**\\
  [Zstandard](https://en.wikipedia.org/wiki/Zstd) combines a dictionary-matching stage (LZ77) with
  a large search window and a fast entropy coding stage, using both Finite State Entropy and
  Huffman coding. Compression speed can vary by a factor of 20 or more between the fastest and
  slowest levels, while decompression is uniformly fast, varying by less than 20% between the
  fastest and slowest levels.\\
  ZStandard is the most flexible of the available compression codec options, offering a compression
  ratio similar to LZ4 at level 1 (but with slightly less performance), compression ratios
  comparable to DEFLATE at mid levels (but with better performance), and LZMA-alike dense
  compression (and LZMA-alike compression speeds) at high levels; while providing universally fast
  decompression.

## Data Block Encoding Types

### Prefix

Often, keys are very similar. Specifically, keys often share a common prefix and only differ near the end. For instance, one key might be \`RowKey:Family:Qualifier0\` and the next key might be \`RowKey:Family:Qualifier1\`.
In Prefix encoding, an extra column is added which holds the length of the prefix shared between the current key and the previous key. Assuming the first key here is totally different from the key before, its prefix length is 0.

The second key's prefix length is \`23\`, since they have the first 23 characters in common.

Obviously if the keys tend to have nothing in common, Prefix will not provide much benefit.

The following image shows a hypothetical ColumnFamily with no data block encoding.

<img alt="ColumnFamily with No Encoding" src={__img0} />

Here is the same data with prefix data encoding.

<img alt="ColumnFamily with Prefix Encoding" src={__img1} />

### Diff

Diff encoding expands upon Prefix encoding.
Instead of considering the key sequentially as a monolithic series of bytes, each key field is split so that each part of the key can be compressed more efficiently.

Two new fields are added: timestamp and type.

If the ColumnFamily is the same as the previous row, it is omitted from the current row.

If the key length, value length or type are the same as the previous row, the field is omitted.

In addition, for increased compression, the timestamp is stored as a Diff from the previous row's timestamp, rather than being stored in full.
Given the two row keys in the Prefix example, and given an exact match on timestamp and the same type, neither the value length, or type needs to be stored for the second row, and the timestamp value for the second row is just 0, rather than a full timestamp.

Diff encoding is disabled by default because writing and scanning are slower but more data is cached.

This image shows the same ColumnFamily from the previous images, with Diff encoding.

<img alt="ColumnFamily with Diff Encoding" src={__img2} />

### Fast Diff

Fast Diff works similar to Diff, but uses a faster implementation. It also adds another field which stores a single bit to track whether the data itself is the same as the previous row. If it is, the data is not stored again.

Fast Diff is the recommended codec to use if you have long keys or many columns.

The data format is nearly identical to Diff encoding, so there is not an image to illustrate it.

### Prefix Tree

Prefix tree encoding was introduced as an experimental feature in HBase 0.96.
It provides similar memory savings to the Prefix, Diff, and Fast Diff encoder, but provides faster random access at a cost of slower encoding speed.
It was removed in hbase-2.0.0. It was a good idea but little uptake. If interested in reviving this effort, write the hbase dev list.

## Which Compressor or Data Block Encoder To Use

The compression or codec type to use depends on the characteristics of your data. Choosing the wrong type could cause your data to take more space rather than less, and can have performance implications.

In general, you need to weigh your options between smaller size and faster compression/decompression. Following are some general guidelines, expanded from a discussion at [Documenting Guidance on compression and codecs](https://lists.apache.org/thread.html/481e67a61163efaaf4345510447a9244871a8d428244868345a155ff%401378926618%40%3Cdev.hbase.apache.org%3E).

* In most cases, enabling LZ4 or Snappy by default is a good choice, because they have a low
  performance overhead and provide reasonable space savings. A fast compression algorithm almost
  always improves overall system performance by trading some increased CPU usage for better I/O
  efficiency.
* If the values are large (and not pre-compressed, such as images), use a data block compressor.
* For *cold data*, which is accessed infrequently, depending on your use case, it might
  make sense to opt for Zstandard at its higher compression levels, or LZMA, especially for high
  entropy binary data, or Brotli for data similar in characteristics to web data. Bzip2 might also
  be a reasonable option but Zstandard is very likely to offer superior decompression speed.
* For *hot data*, which is accessed frequently, you almost certainly want only LZ4,
  Snappy, LZO, or Zstandard at a low compression level. These options will not provide as high of
  a compression ratio but will in trade not unduly impact system performance.
* If you have long keys (compared to the values) or many columns, use a prefix encoder.
  FAST\\_DIFF is recommended.
* If enabling WAL value compression, consider LZ4 or SNAPPY compression, or Zstandard at
  level 1. Reading and writing the WAL is performance critical. That said, the I/O
  savings of these compression options can improve overall system performance.

## Making use of Hadoop Native Libraries in HBase

The Hadoop shared library has a bunch of facility including compression libraries and fast crc'ing — hardware crc'ing if your chipset supports it.
To make this facility available to HBase, do the following. HBase/Hadoop will fall back to use alternatives if it cannot find the native library
versions — or fail outright if you asking for an explicit compressor and there is no alternative available.

First make sure of your Hadoop. Fix this message if you are seeing it starting Hadoop processes:

\`\`\`
16/02/09 22:40:24 WARN util.NativeCodeLoader: Unable to load native-hadoop library for your platform... using builtin-java classes where applicable
\`\`\`

It means is not properly pointing at its native libraries or the native libs were compiled for another platform.
Fix this first.

Then if you see the following in your HBase logs, you know that HBase was unable to locate the Hadoop native libraries:

\`\`\`
2014-08-07 09:26:20,139 WARN  [main] util.NativeCodeLoader: Unable to load native-hadoop library for your platform... using builtin-java classes where applicable
\`\`\`

If the libraries loaded successfully, the WARN message does not show. Usually this means you are good to go but read on.

Let's presume your Hadoop shipped with a native library that suits the platform you are running HBase on.
To check if the Hadoop native library is available to HBase, run the following tool (available in Hadoop 2.1 and greater):

\`\`\`bash
$ ./bin/hbase --config ~/conf_hbase org.apache.hadoop.util.NativeLibraryChecker
2014-08-26 13:15:38,717 WARN  [main] util.NativeCodeLoader: Unable to load native-hadoop library for your platform... using builtin-java classes where applicable
Native library checking:
hadoop: false
zlib:   false
snappy: false
lz4:    false
bzip2:  false
2014-08-26 13:15:38,863 INFO  [main] util.ExitUtil: Exiting with status 1
\`\`\`

Above shows that the native hadoop library is not available in HBase context.

The above NativeLibraryChecker tool may come back saying all is hunky-dory
— i.e. all libs show 'true', that they are available — but follow the below
presecription anyways to ensure the native libs are available in HBase context,
when it goes to use them.

To fix the above, either copy the Hadoop native libraries local or symlink to them if the Hadoop and HBase stalls are adjacent in the filesystem.
You could also point at their location by setting the \`LD_LIBRARY_PATH\` environment variable in your hbase-env.sh.

Where the JVM looks to find native libraries is "system dependent" (See \`java.lang.System#loadLibrary(name)\`). On linux, by default, is going to look in *lib/native/PLATFORM* where \`PLATFORM\` is the label for the platform your HBase is installed on.
On a local linux machine, it seems to be the concatenation of the java properties \`os.name\` and \`os.arch\` followed by whether 32 or 64 bit.
HBase on startup prints out all of the java system properties so find the os.name and os.arch in the log.
For example:

\`\`\`
...
2014-08-06 15:27:22,853 INFO  [main] zookeeper.ZooKeeper: Client environment:os.name=Linux
2014-08-06 15:27:22,853 INFO  [main] zookeeper.ZooKeeper: Client environment:os.arch=amd64
...
\`\`\`

So in this case, the PLATFORM string is \`Linux-amd64-64\`.
Copying the Hadoop native libraries or symlinking at *lib/native/Linux-amd64-64* will ensure they are found.
Rolling restart after you have made this change.

Here is an example of how you would set up the symlinks.
Let the hadoop and hbase installs be in your home directory. Assume your hadoop native libs
are at \\~/hadoop/lib/native. Assume you are on a Linux-amd64-64 platform. In this case,
you would do the following to link the hadoop native lib so hbase could find them.

\`\`\`bash
...
$ mkdir -p ~/hbaseLinux-amd64-64 -> /home/stack/hadoop/lib/native/lib/native/
$ cd ~/hbase/lib/native/
$ ln -s ~/hadoop/lib/native Linux-amd64-64
$ ls -la
# Linux-amd64-64 -> /home/USER/hadoop/lib/native
...
\`\`\`

If you see PureJavaCrc32C in a stack track or if you see something like the below in a perf trace, then native is not working; you are using the java CRC functions rather than native:

\`\`\`
  5.02%  perf-53601.map      [.] Lorg/apache/hadoop/util/PureJavaCrc32C;.update
\`\`\`

See [HBASE-11927 Use Native Hadoop Library for HFile checksum (And flip default from CRC32 to CRC32C)](https://issues.apache.org/jira/browse/HBASE-11927),
for more on native checksumming support. See in particular the release note for how to check if your hardware to see if your processor has support for hardware CRCs.
Or checkout the Apache [Checksums in HBase](https://blogs.apache.org/hbase/entry/saving_cpu_using_native_hadoop) blog post.

Here is example of how to point at the Hadoop libs with \`LD_LIBRARY_PATH\` environment variable:

\`\`\`bash
$ LD_LIBRARY_PATH=~/hadoop-2.5.0-SNAPSHOT/lib/native ./bin/hbase --config ~/conf_hbase org.apache.hadoop.util.NativeLibraryChecker
2014-08-26 13:42:49,332 INFO  [main] bzip2.Bzip2Factory: Successfully loaded & initialized native-bzip2 library system-native
2014-08-26 13:42:49,337 INFO  [main] zlib.ZlibFactory: Successfully loaded & initialized native-zlib library
Native library checking:
hadoop: true /home/stack/hadoop-2.5.0-SNAPSHOT/lib/native/libhadoop.so.1.0.0
zlib:   true /lib64/libz.so.1
snappy: true /usr/lib64/libsnappy.so.1
lz4:    true revision:99
bzip2:  true /lib64/libbz2.so.1
\`\`\`

Set in *hbase-env.sh* the LD\\_LIBRARY\\_PATH environment variable when starting your HBase.

## Compressor Configuration, Installation, and Use

### Configure HBase For Compressors

Compression codecs are provided either by HBase compressor modules or by Hadoop's native compression
support. As described above you choose a compression type in table or column family schema or in
site configuration using its short label, e.g. *snappy* for Snappy, or *zstd* for ZStandard. Which
codec implementation is dynamically loaded to support what label is configurable by way of site
configuration.

| Algorithm label | Codec implementation configuration key | Default value                                               |
| --------------- | -------------------------------------- | ----------------------------------------------------------- |
| BROTLI          | hbase.io.compress.brotli.codec         | org.apache.hadoop.hbase.io.compress.brotli.BrotliCodec      |
| BZIP2           | hbase.io.compress.bzip2.codec          | org.apache.hadoop.io.compress.BZip2Codec                    |
| GZ              | hbase.io.compress.gz.codec             | org.apache.hadoop.hbase.io.compress.ReusableStreamGzipCodec |
| LZ4             | hbase.io.compress.lz4.codec            | org.apache.hadoop.io.compress.Lz4Codec                      |
| LZMA            | hbase.io.compress.lzma.codec           | org.apache.hadoop.hbase.io.compress.xz.LzmaCodec            |
| LZO             | hbase.io.compress.lzo.codec            | com.hadoop.compression.lzo.LzoCodec                         |
| SNAPPY          | hbase.io.compress.snappy.codec         | org.apache.hadoop.io.compress.SnappyCodec                   |
| ZSTD            | hbase.io.compress.zstd.codec           | org.apache.hadoop.io.compress.ZStandardCodec                |

The available codec implementation options are:

| Label  | Codec implementation class                                    | Notes                                                                                                                         |
| ------ | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| BROTLI | org.apache.hadoop.hbase.io.compress.brotli.BrotliCodec        | Implemented with [Brotli4j](https://github.com/hyperxpro/Brotli4j)                                                            |
| BZIP2  | org.apache.hadoop.io.compress.BZip2Codec                      | Hadoop native codec                                                                                                           |
| GZ     | org.apache.hadoop.hbase.io.compress.ReusableStreamGzipCodec   | Requires the Hadoop native GZ codec                                                                                           |
| LZ4    | org.apache.hadoop.io.compress.Lz4Codec                        | Hadoop native codec                                                                                                           |
| LZ4    | org.apache.hadoop.hbase.io.compress.aircompressor.Lz4Codec    | Pure Java implementation                                                                                                      |
| LZ4    | org.apache.hadoop.hbase.io.compress.lz4.Lz4Codec              | Implemented with [lz4-java](https://github.com/lz4/lz4-java)                                                                  |
| LZMA   | org.apache.hadoop.hbase.io.compress.xz.LzmaCodec              | Implemented with [XZ For Java](https://tukaani.org/xz/java.html)                                                              |
| LZO    | com.hadoop.compression.lzo.LzoCodec                           | Hadoop native codec, requires GPL licensed native dependencies                                                                |
| LZO    | org.apache.hadoop.io.compress.LzoCodec                        | Hadoop native codec, requires GPL licensed native dependencies                                                                |
| LZO    | org.apache.hadoop.hbase.io.compress.aircompressor.LzoCodec    | Pure Java implementation                                                                                                      |
| SNAPPY | org.apache.hadoop.io.compress.SnappyCodec                     | Hadoop native codec                                                                                                           |
| SNAPPY | org.apache.hadoop.hbase.io.compress.aircompressor.SnappyCodec | Pure Java implementation                                                                                                      |
| SNAPPY | org.apache.hadoop.hbase.io.compress.xerial.SnappyCodec        | Implemented with [snappy-java](https://github.com/xerial/snappy-java)                                                         |
| ZSTD   | org.apache.hadoop.io.compress.ZStandardCodec                  | Hadoop native codec                                                                                                           |
| ZSTD   | org.apache.hadoop.hbase.io.compress.aircompressor.ZstdCodec   | Pure Java implementation, limited to a fixed compression level, not data compatible with the Hadoop zstd codec                |
| ZSTD   | org.apache.hadoop.hbase.io.compress.zstd.ZstdCodec            | Implemented with [zstd-jni](https://github.com/luben/zstd-jni), supports all compression levels, supports custom dictionaries |

Specify which codec implementation option you prefer for a given compression algorithm
in site configuration, like so:

\`\`\`xml
...
<property>
  <name>hbase.io.compress.lz4.codec</name>
  <value>org.apache.hadoop.hbase.io.compress.lz4.Lz4Codec</value>
</property>
...
\`\`\`

#### Compressor Microbenchmarks

See [https://github.com/apurtell/jmh-compression-tests](https://github.com/apurtell/jmh-compression-tests)

256MB (258,126,022 bytes exactly) of block data was extracted from two HFiles containing Common
Crawl data ingested using IntegrationLoadTestCommonCrawl, 2,680 blocks in total. This data was
processed by each new codec implementation as if the block data were being compressed again for
write into an HFile, but without writing any data, comparing only the CPU time and resource demand
of the codec itself. Absolute performance numbers will vary depending on hardware and software
particulars of your deployment. The relative differences are what are interesting. Measured time
is the average time in milliseconds required to compress all blocks of the 256MB file. This is
how long it would take to write the HFile containing these contents, minus the I/O overhead of
block encoding and actual persistence.

These are the results:

| Codec                   | Level         | Time (milliseconds)  | Result (bytes) | Improvement |
| ----------------------- | ------------- | -------------------- | -------------- | ----------- |
| AirCompressor LZ4       | -             | 349.989 ± 2.835      | 76,999,408     | 70.17%      |
| AirCompressor LZO       | -             | 334.554 ± 3.243      | 79,369,805     | 69.25%      |
| AirCompressor Snappy    | -             | 364.153 ± 19.718     | 80,201,763     | 68.93%      |
| AirCompressor Zstandard | 3 (effective) | 1108.267 ± 8.969     | 55,129,189     | 78.64%      |
| Brotli                  | 1             | 593.107 ± 2.376      | 58,672,319     | 77.27%      |
| Brotli                  | 3             | 1345.195 ± 27.327    | 53,917,438     | 79.11%      |
| Brotli                  | 6             | 2812.411 ± 25.372    | 48,696,441     | 81.13%      |
| Brotli                  | 10            | 74615.936 ± 224.854  | 44,970,710     | 82.58%      |
| LZ4 (lz4-java)          | -             | 303.045 ± 0.783      | 76,974,364     | 70.18%      |
| LZMA                    | 1             | 6410.428 ± 115.065   | 49,948,535     | 80.65%      |
| LZMA                    | 3             | 8144.620 ± 152.119   | 49,109,363     | 80.97%      |
| LZMA                    | 6             | 43802.576 ± 382.025  | 46,951,810     | 81.81%      |
| LZMA                    | 9             | 49821.979 ± 580.110  | 46,951,810     | 81.81%      |
| Snappy (xerial)         | -             | 360.225 ± 2.324      | 80,749,937     | 68.72%      |
| Zstd (zstd-jni)         | 1             | 654.699 ± 16.839     | 56,719,994     | 78.03%      |
| Zstd (zstd-jni)         | 3             | 839.160 ± 24.906     | 54,573,095     | 78.86%      |
| Zstd (zstd-jni)         | 5             | 1594.373 ± 22.384    | 52,025,485     | 79.84%      |
| Zstd (zstd-jni)         | 7             | 2308.705 ± 24.744    | 50,651,554     | 80.38%      |
| Zstd (zstd-jni)         | 9             | 3659.677 ± 58.018    | 50,208,425     | 80.55%      |
| Zstd (zstd-jni)         | 12            | 8705.294 ± 58.080    | 49,841,446     | 80.69%      |
| Zstd (zstd-jni)         | 15            | 19785.646 ± 278.080  | 48,499,508     | 81.21%      |
| Zstd (zstd-jni)         | 18            | 47702.097 ± 442.670  | 48,319,879     | 81.28%      |
| Zstd (zstd-jni)         | 22            | 97799.695 ± 1106.571 | 48,212,220     | 81.32%      |

#### Compressor Support On the Master

A new configuration setting was introduced in HBase 0.95, to check the Master to determine which data block encoders are installed and configured on it, and assume that the entire cluster is configured the same.
This option, \`hbase.master.check.compression\`, defaults to \`true\`.
This prevents the situation described in [HBASE-6370](https://issues.apache.org/jira/browse/HBASE-6370), where a table is created or modified to support a codec that a region server does not support, leading to failures that take a long time to occur and are difficult to debug.

If \`hbase.master.check.compression\` is enabled, libraries for all desired compressors need to be installed and configured on the Master, even if the Master does not run a region server.

#### Install GZ Support Via Native Libraries

HBase uses Java's built-in GZip support unless the native Hadoop libraries are available on the CLASSPATH.
The recommended way to add libraries to the CLASSPATH is to set the environment variable \`HBASE_LIBRARY_PATH\` for the user running HBase.
If native libraries are not available and Java's GZIP is used, \`Got brand-new compressor\` reports will be present in the logs.
See [brand.new.compressor](/docs/troubleshooting#logs-flooded-with-2011-01-10-124048407-info-orgapachehadoopiocompresscodecpool-gotbrand-new-compressor-messages)).

#### Install Hadoop Native LZO Support

HBase cannot ship with the Hadoop native LZO codc because of incompatibility between HBase, which uses an Apache Software License (ASL) and LZO, which uses a GPL license.
See the [Hadoop-LZO at Twitter](https://github.com/twitter/hadoop-lzo/blob/master/README.md) for information on configuring LZO support for HBase.

If you depend upon LZO compression, consider using the pure Java and ASL licensed
AirCompressor LZO codec option instead of the Hadoop native default, or configure your
RegionServers to fail to start if native LZO support is not available.
See [hbase.regionserver.codecs](/docs/compression#enforce-compression-settings-on-a-regionserver).

#### Configure Hadoop Native LZ4 Support

LZ4 support is bundled with Hadoop and is the default LZ4 codec implementation.
It is not required that you make use of the Hadoop LZ4 codec. Our LZ4 codec implemented
with lz4-java offers superior performance, and the AirCompressor LZ4 codec offers a
pure Java option for use where native support is not available.

That said, if you prefer the Hadoop option, make sure the hadoop shared library
(libhadoop.so) is accessible when you start HBase.
After configuring your platform (see [hadoop.native.lib](/docs/compression#making-use-of-hadoop-native-libraries-in-hbase)), you can
make a symbolic link from HBase to the native Hadoop libraries. This assumes the two
software installs are colocated. For example, if my 'platform' is Linux-amd64-64:

\`\`\`bash
$ cd $HBASE_HOME
$ mkdir lib/native
$ ln -s $HADOOP_HOME/lib/native lib/native/Linux-amd64-64
\`\`\`

Use the compression tool to check that LZ4 is installed on all nodes.
Start up (or restart) HBase.
Afterward, you can create and alter tables to enable LZ4 as a compression codec.:

\`\`\`ruby
hbase(main):003:0> alter 'TestTable', {NAME => 'info', COMPRESSION => 'LZ4'}
\`\`\`

#### Install Hadoop native Snappy Support

Snappy support is bundled with Hadoop and is the default Snappy codec implementation.
It is not required that you make use of the Hadoop Snappy codec. Our Snappy codec
implemented with Xerial Snappy offers superior performance, and the AirCompressor
Snappy codec offers a pure Java option for use where native support is not available.

That said, if you prefer the Hadoop codec option, you can install Snappy binaries (for
instance, by using +yum install snappy+ on CentOS) or build Snappy from source.
After installing Snappy, search for the shared library, which will be called *libsnappy.so.X* where X is a number.
If you built from source, copy the shared library to a known location on your system, such as */opt/snappy/lib/*.

In addition to the Snappy library, HBase also needs access to the Hadoop shared library, which will be called something like *libhadoop.so.X.Y*, where X and Y are both numbers.
Make note of the location of the Hadoop library, or copy it to the same location as the Snappy library.

<Callout type="info">
  The Snappy and Hadoop libraries need to be available on each node of your cluster.
  See [compression.test](/docs/compression#compressiontest) to find out how to test that this is the case.

  See [hbase.regionserver.codecs](/docs/compression#enforce-compression-settings-on-a-regionserver) to configure your RegionServers to fail to start if a given compressor is not available.
</Callout>

Each of these library locations need to be added to the environment variable \`HBASE_LIBRARY_PATH\` for the operating system user that runs HBase.
You need to restart the RegionServer for the changes to take effect.

#### CompressionTest

You can use the CompressionTest tool to verify that your compressor is available to HBase:

\`\`\`bash
 $ hbase org.apache.hadoop.hbase.util.CompressionTest hdfs://host/path/to/hbase snappy
\`\`\`

#### Enforce Compression Settings On a RegionServer

You can configure a RegionServer so that it will fail to restart if compression is configured incorrectly, by adding the option hbase.regionserver.codecs to the *hbase-site.xml*, and setting its value to a comma-separated list of codecs that need to be available.
For example, if you set this property to \`lzo,gz\`, the RegionServer would fail to start if both compressors were not available.
This would prevent a new server from being added to the cluster without having codecs configured properly.

### Enable Compression On a ColumnFamily

To enable compression for a ColumnFamily, use an \`alter\` command.
You do not need to re-create the table or copy data.
If you are changing codecs, be sure the old codec is still available until all the old StoreFiles have been compacted.

#### Enabling Compression on a ColumnFamily of an Existing Table using HBaseShell

\`\`\`ruby
hbase> alter 'test', {NAME => 'cf', COMPRESSION => 'GZ'}
\`\`\`

#### Creating a New Table with Compression On a ColumnFamily

\`\`\`ruby
hbase> create 'test2', { NAME => 'cf2', COMPRESSION => 'SNAPPY' }
\`\`\`

#### Verifying a ColumnFamily's Compression Settings

\`\`\`ruby
hbase> describe 'test'
DESCRIPTION                                          ENABLED
 'test', {NAME => 'cf', DATA_BLOCK_ENCODING => 'NONE false
 ', BLOOMFILTER => 'ROW', REPLICATION_SCOPE => '0',
 VERSIONS => '1', COMPRESSION => 'GZ', MIN_VERSIONS
 => '0', TTL => 'FOREVER', KEEP_DELETED_CELLS => 'fa
 lse', BLOCKSIZE => '65536', IN_MEMORY => 'false', B
 LOCKCACHE => 'true'}
1 row(s) in 0.1070 seconds
\`\`\`

### Testing Compression Performance

HBase includes a tool called LoadTestTool which provides mechanisms to test your compression performance.
You must specify either \`-write\` or \`-update-read\` as your first parameter, and if you do not specify another parameter, usage advice is printed for each option.

**\`LoadTestTool\` Usage**

\`\`\`bash
$ bin/hbase org.apache.hadoop.hbase.util.LoadTestTool -h
usage: bin/hbase org.apache.hadoop.hbase.util.LoadTestTool <options>
Options:
 -batchupdate                 Whether to use batch as opposed to separate
                              updates for every column in a row
 -bloom <arg>                 Bloom filter type, one of [NONE, ROW, ROWCOL]
 -compression <arg>           Compression type, one of [LZO, GZ, NONE, SNAPPY,
                              LZ4]
 -data_block_encoding <arg>   Encoding algorithm (e.g. prefix compression) to
                              use for data blocks in the test column family, one
                              of [NONE, PREFIX, DIFF, FAST_DIFF, ROW_INDEX_V1].
 -encryption <arg>            Enables transparent encryption on the test table,
                              one of [AES]
 -generator <arg>             The class which generates load for the tool. Any
                              args for this class can be passed as colon
                              separated after class name
 -h,--help                    Show usage
 -in_memory                   Tries to keep the HFiles of the CF inmemory as far
                              as possible.  Not guaranteed that reads are always
                              served from inmemory
 -init_only                   Initialize the test table only, don't do any
                              loading
 -key_window <arg>            The 'key window' to maintain between reads and
                              writes for concurrent write/read workload. The
                              default is 0.
 -max_read_errors <arg>       The maximum number of read errors to tolerate
                              before terminating all reader threads. The default
                              is 10.
 -multiput                    Whether to use multi-puts as opposed to separate
                              puts for every column in a row
 -num_keys <arg>              The number of keys to read/write
 -num_tables <arg>            A positive integer number. When a number n is
                              speicfied, load test tool  will load n table
                              parallely. -tn parameter value becomes table name
                              prefix. Each table name is in format
                              <tn>_1...<tn>_n
 -read <arg>                  <verify_percent>[:#threads=20]
 -regions_per_server <arg>    A positive integer number. When a number n is
                              specified, load test tool will create the test
                              table with n regions per server
 -skip_init                   Skip the initialization; assume test table already
                              exists
 -start_key <arg>             The first key to read/write (a 0-based index). The
                              default value is 0.
 -tn <arg>                    The name of the table to read or write
 -update <arg>                <update_percent>[:#threads=20][:#whether to
                              ignore nonce collisions=0]
 -write <arg>                 <avg_cols_per_key>:<avg_data_size>[:#threads=20]
 -zk <arg>                    ZK quorum as comma-separated host names without
                              port numbers
 -zk_root <arg>               name of parent znode in zookeeper
\`\`\`

#### Example Usage of LoadTestTool

\`\`\`bash
$ hbase org.apache.hadoop.hbase.util.LoadTestTool -write 1:10:100 -num_keys 1000000 \\
      -read 100:30 -num_tables 1 -data_block_encoding NONE -tn load_test_tool_NONE
\`\`\`

## Enable Data Block Encoding

Codecs are built into HBase so no extra configuration is needed.
Codecs are enabled on a table by setting the \`DATA_BLOCK_ENCODING\` property.
Disable the table before altering its DATA\\_BLOCK\\_ENCODING setting.
Following is an example using HBase Shell:

#### Enable Data Block Encoding On a Table

\`\`\`ruby
hbase> alter 'test', { NAME => 'cf', DATA_BLOCK_ENCODING => 'FAST_DIFF' }
Updating all regions with the new schema...
0/1 regions updated.
1/1 regions updated.
Done.
0 row(s) in 2.2820 seconds
\`\`\`

#### Verifying a ColumnFamily's Data Block Encoding

\`\`\`ruby
hbase> describe 'test'
DESCRIPTION                                          ENABLED
 'test', {NAME => 'cf', DATA_BLOCK_ENCODING => 'FAST true
 _DIFF', BLOOMFILTER => 'ROW', REPLICATION_SCOPE =>
 '0', VERSIONS => '1', COMPRESSION => 'GZ', MIN_VERS
 IONS => '0', TTL => 'FOREVER', KEEP_DELETED_CELLS =
 > 'false', BLOCKSIZE => '65536', IN_MEMORY => 'fals
 e', BLOCKCACHE => 'true'}
1 row(s) in 0.0650 seconds
\`\`\`
`,p={title:"Compression and Data Block Encoding In HBase",description:"Comprehensive guide to compression algorithms and data block encoding options in HBase for optimizing storage and performance."},m=[{href:"/docs/operational-management/cluster-replication#life-of-a-wal-edit"},{href:"/docs/compression#making-use-of-hadoop-native-libraries-in-hbase"},{href:"/docs/compression#compressiontest"},{href:"/docs/compression#compressor-configuration-installation-and-use"},{href:"/docs/compression#enable-compression-on-a-columnfamily"},{href:"/docs/compression#enable-data-block-encoding"},{href:"https://en.wikipedia.org/wiki/Brotli"},{href:"https://en.wikipedia.org/wiki/Bzip2"},{href:"https://en.wikipedia.org/wiki/Deflate"},{href:"https://en.wikipedia.org/wiki/LZ4_(compression_algorithm)"},{href:"https://en.wikipedia.org/wiki/Lempel%E2%80%93Ziv%E2%80%93Markov_chain_algorithm"},{href:"https://en.wikipedia.org/wiki/Lempel%E2%80%93Ziv%E2%80%93Oberhumer"},{href:"https://en.wikipedia.org/wiki/Snappy_(compression)"},{href:"https://en.wikipedia.org/wiki/Zstd"},{href:"https://lists.apache.org/thread.html/481e67a61163efaaf4345510447a9244871a8d428244868345a155ff%401378926618%40%3Cdev.hbase.apache.org%3E"},{href:"https://issues.apache.org/jira/browse/HBASE-11927"},{href:"https://blogs.apache.org/hbase/entry/saving_cpu_using_native_hadoop"},{href:"https://github.com/hyperxpro/Brotli4j"},{href:"https://github.com/lz4/lz4-java"},{href:"https://tukaani.org/xz/java.html"},{href:"https://github.com/xerial/snappy-java"},{href:"https://github.com/luben/zstd-jni"},{href:"https://github.com/apurtell/jmh-compression-tests"},{href:"https://issues.apache.org/jira/browse/HBASE-6370"},{href:"/docs/troubleshooting#logs-flooded-with-2011-01-10-124048407-info-orgapachehadoopiocompresscodecpool-gotbrand-new-compressor-messages"},{href:"https://github.com/twitter/hadoop-lzo/blob/master/README.md"},{href:"/docs/compression#enforce-compression-settings-on-a-regionserver"},{href:"/docs/compression#making-use-of-hadoop-native-libraries-in-hbase"},{href:"/docs/compression#compressiontest"},{href:"/docs/compression#enforce-compression-settings-on-a-regionserver"}],k={contents:[{heading:void 0,content:`Codecs mentioned in this section are for encoding and decoding data blocks or row keys. For
information about replication codecs, see
cluster.replication.preserving.tags.`},{heading:void 0,content:`HBase supports several different compression algorithms which can be enabled on a ColumnFamily.
Data block encoding attempts to limit duplication of information in keys, taking advantage of some of the fundamental designs and patterns of HBase, such as sorted row keys and the schema of a given table.
Compressors reduce the size of large, opaque byte arrays in cells, and can significantly reduce the storage space needed to store uncompressed data.`},{heading:void 0,content:"Compressors and data block encoding can be used together on the same ColumnFamily."},{heading:"changes-take-effect-upon-compaction",content:"If you change compression or encoding for a ColumnFamily, the changes take effect during compaction."},{heading:"changes-take-effect-upon-compaction",content:`Some codecs take advantage of capabilities built into Java, such as GZip compression.
Others rely on native libraries. Native libraries may be available via codec dependencies installed into
HBase's library directory, or, if you are utilizing Hadoop codecs, as part of Hadoop. Hadoop codecs
typically have a native code component so follow instructions for installing Hadoop native binary
support at Making use of Hadoop Native Libraries in HBase.`},{heading:"changes-take-effect-upon-compaction",content:"This section discusses common codecs that are used and tested with HBase."},{heading:"changes-take-effect-upon-compaction",content:`No matter what codec you use, be sure to test that it is installed correctly and is available on all nodes in your cluster.
Extra operational steps may be necessary to be sure that codecs are available on newly-deployed nodes.
You can use the compression.test utility to check that a given codec is correctly installed.`},{heading:"changes-take-effect-upon-compaction",content:`To configure HBase to use a compressor, see compressor.install.
To enable a compressor for a ColumnFamily, see changing.compression.
To enable data block encoding for a ColumnFamily, see data.block.encoding.enable.`},{heading:"block-compressors",content:`**NONE**\\
This compression type constant selects no compression, and is the default.`},{heading:"block-compressors",content:`**BROTLI**\\
Brotli is a generic-purpose lossless compression algorithm
that compresses data using a combination of a modern variant of the LZ77 algorithm, Huffman
coding, and 2nd order context modeling, with a compression ratio comparable to the best currently
available general-purpose compression methods. It is similar in speed with GZ but offers more
dense compression.`},{heading:"block-compressors",content:`**BZIP2**\\
Bzip2 compresses files using the Burrows-Wheeler block
sorting text compression algorithm and Huffman coding. Compression is generally considerably
better than that achieved by the dictionary- (LZ-) based compressors, but both compression and
decompression can be slow in comparison to other options.`},{heading:"block-compressors",content:`**GZ**\\
gzip is based on the DEFLATE algorithm, which is a
combination of LZ77 and Huffman coding. It is universally available in the Java Runtime
Environment so is a good lowest common denominator option. However in comparison to more modern
algorithms like Zstandard it is quite slow.`},{heading:"block-compressors",content:`**LZ4**\\
LZ4 is a lossless data compression
algorithm that is focused on compression and decompression speed. It belongs to the LZ77 family
of compression algorithms, like Brotli, DEFLATE, Zstandard, and others. In our microbenchmarks
LZ4 is the fastest option for both compression and decompression in that family, and is our
universally recommended option.`},{heading:"block-compressors",content:`**LZMA**\\
LZMA is a
dictionary compression scheme somewhat similar to the LZ77 algorithm that achieves very high
compression ratios with a computationally expensive predictive model and variable size
compression dictionary, while still maintaining decompression speed similar to other commonly used
compression algorithms. LZMA is superior to all other options in general compression ratio but as
a compressor it can be extremely slow, especially when configured to operate at higher levels of
compression.`},{heading:"block-compressors",content:`**LZO**\\
LZO is another LZ-variant
data compression algorithm, with an implementation focused on decompression speed. It is almost
but not quite as fast as LZ4.`},{heading:"block-compressors",content:`**SNAPPY**\\
Snappy is based on ideas from LZ77 but is
optimized for very high compression speed, achieving only a "reasonable" compression in trade.
It is as fast as LZ4 but does not compress quite as well. We offer a pure Java Snappy codec
that can be used instead of GZ as the universally available option for any Java runtime on any
hardware architecture.`},{heading:"block-compressors",content:`**ZSTD**\\
Zstandard combines a dictionary-matching stage (LZ77) with
a large search window and a fast entropy coding stage, using both Finite State Entropy and
Huffman coding. Compression speed can vary by a factor of 20 or more between the fastest and
slowest levels, while decompression is uniformly fast, varying by less than 20% between the
fastest and slowest levels.\\
ZStandard is the most flexible of the available compression codec options, offering a compression
ratio similar to LZ4 at level 1 (but with slightly less performance), compression ratios
comparable to DEFLATE at mid levels (but with better performance), and LZMA-alike dense
compression (and LZMA-alike compression speeds) at high levels; while providing universally fast
decompression.`},{heading:"prefix",content:"Often, keys are very similar. Specifically, keys often share a common prefix and only differ near the end. For instance, one key might be `RowKey:Family:Qualifier0` and the next key might be `RowKey:Family:Qualifier1`.\nIn Prefix encoding, an extra column is added which holds the length of the prefix shared between the current key and the previous key. Assuming the first key here is totally different from the key before, its prefix length is 0."},{heading:"prefix",content:"The second key's prefix length is `23`, since they have the first 23 characters in common."},{heading:"prefix",content:"Obviously if the keys tend to have nothing in common, Prefix will not provide much benefit."},{heading:"prefix",content:"The following image shows a hypothetical ColumnFamily with no data block encoding."},{heading:"prefix",content:"Here is the same data with prefix data encoding."},{heading:"diff",content:`Diff encoding expands upon Prefix encoding.
Instead of considering the key sequentially as a monolithic series of bytes, each key field is split so that each part of the key can be compressed more efficiently.`},{heading:"diff",content:"Two new fields are added: timestamp and type."},{heading:"diff",content:"If the ColumnFamily is the same as the previous row, it is omitted from the current row."},{heading:"diff",content:"If the key length, value length or type are the same as the previous row, the field is omitted."},{heading:"diff",content:`In addition, for increased compression, the timestamp is stored as a Diff from the previous row's timestamp, rather than being stored in full.
Given the two row keys in the Prefix example, and given an exact match on timestamp and the same type, neither the value length, or type needs to be stored for the second row, and the timestamp value for the second row is just 0, rather than a full timestamp.`},{heading:"diff",content:"Diff encoding is disabled by default because writing and scanning are slower but more data is cached."},{heading:"diff",content:"This image shows the same ColumnFamily from the previous images, with Diff encoding."},{heading:"fast-diff",content:"Fast Diff works similar to Diff, but uses a faster implementation. It also adds another field which stores a single bit to track whether the data itself is the same as the previous row. If it is, the data is not stored again."},{heading:"fast-diff",content:"Fast Diff is the recommended codec to use if you have long keys or many columns."},{heading:"fast-diff",content:"The data format is nearly identical to Diff encoding, so there is not an image to illustrate it."},{heading:"prefix-tree",content:`Prefix tree encoding was introduced as an experimental feature in HBase 0.96.
It provides similar memory savings to the Prefix, Diff, and Fast Diff encoder, but provides faster random access at a cost of slower encoding speed.
It was removed in hbase-2.0.0. It was a good idea but little uptake. If interested in reviving this effort, write the hbase dev list.`},{heading:"which-compressor-or-data-block-encoder-to-use",content:"The compression or codec type to use depends on the characteristics of your data. Choosing the wrong type could cause your data to take more space rather than less, and can have performance implications."},{heading:"which-compressor-or-data-block-encoder-to-use",content:"In general, you need to weigh your options between smaller size and faster compression/decompression. Following are some general guidelines, expanded from a discussion at Documenting Guidance on compression and codecs."},{heading:"which-compressor-or-data-block-encoder-to-use",content:`In most cases, enabling LZ4 or Snappy by default is a good choice, because they have a low
performance overhead and provide reasonable space savings. A fast compression algorithm almost
always improves overall system performance by trading some increased CPU usage for better I/O
efficiency.`},{heading:"which-compressor-or-data-block-encoder-to-use",content:"If the values are large (and not pre-compressed, such as images), use a data block compressor."},{heading:"which-compressor-or-data-block-encoder-to-use",content:`For *cold data*, which is accessed infrequently, depending on your use case, it might
make sense to opt for Zstandard at its higher compression levels, or LZMA, especially for high
entropy binary data, or Brotli for data similar in characteristics to web data. Bzip2 might also
be a reasonable option but Zstandard is very likely to offer superior decompression speed.`},{heading:"which-compressor-or-data-block-encoder-to-use",content:`For *hot data*, which is accessed frequently, you almost certainly want only LZ4,
Snappy, LZO, or Zstandard at a low compression level. These options will not provide as high of
a compression ratio but will in trade not unduly impact system performance.`},{heading:"which-compressor-or-data-block-encoder-to-use",content:`If you have long keys (compared to the values) or many columns, use a prefix encoder.
FAST\\_DIFF is recommended.`},{heading:"which-compressor-or-data-block-encoder-to-use",content:`If enabling WAL value compression, consider LZ4 or SNAPPY compression, or Zstandard at
level 1. Reading and writing the WAL is performance critical. That said, the I/O
savings of these compression options can improve overall system performance.`},{heading:"making-use-of-hadoop-native-libraries-in-hbase",content:`The Hadoop shared library has a bunch of facility including compression libraries and fast crc'ing — hardware crc'ing if your chipset supports it.
To make this facility available to HBase, do the following. HBase/Hadoop will fall back to use alternatives if it cannot find the native library
versions — or fail outright if you asking for an explicit compressor and there is no alternative available.`},{heading:"making-use-of-hadoop-native-libraries-in-hbase",content:"First make sure of your Hadoop. Fix this message if you are seeing it starting Hadoop processes:"},{heading:"making-use-of-hadoop-native-libraries-in-hbase",content:`It means is not properly pointing at its native libraries or the native libs were compiled for another platform.
Fix this first.`},{heading:"making-use-of-hadoop-native-libraries-in-hbase",content:"Then if you see the following in your HBase logs, you know that HBase was unable to locate the Hadoop native libraries:"},{heading:"making-use-of-hadoop-native-libraries-in-hbase",content:"If the libraries loaded successfully, the WARN message does not show. Usually this means you are good to go but read on."},{heading:"making-use-of-hadoop-native-libraries-in-hbase",content:`Let's presume your Hadoop shipped with a native library that suits the platform you are running HBase on.
To check if the Hadoop native library is available to HBase, run the following tool (available in Hadoop 2.1 and greater):`},{heading:"making-use-of-hadoop-native-libraries-in-hbase",content:"Above shows that the native hadoop library is not available in HBase context."},{heading:"making-use-of-hadoop-native-libraries-in-hbase",content:`The above NativeLibraryChecker tool may come back saying all is hunky-dory
— i.e. all libs show 'true', that they are available — but follow the below
presecription anyways to ensure the native libs are available in HBase context,
when it goes to use them.`},{heading:"making-use-of-hadoop-native-libraries-in-hbase",content:"To fix the above, either copy the Hadoop native libraries local or symlink to them if the Hadoop and HBase stalls are adjacent in the filesystem.\nYou could also point at their location by setting the `LD_LIBRARY_PATH` environment variable in your hbase-env.sh."},{heading:"making-use-of-hadoop-native-libraries-in-hbase",content:'Where the JVM looks to find native libraries is "system dependent" (See `java.lang.System#loadLibrary(name)`). On linux, by default, is going to look in *lib/native/PLATFORM* where `PLATFORM` is the label for the platform your HBase is installed on.\nOn a local linux machine, it seems to be the concatenation of the java properties `os.name` and `os.arch` followed by whether 32 or 64 bit.\nHBase on startup prints out all of the java system properties so find the os.name and os.arch in the log.\nFor example:'},{heading:"making-use-of-hadoop-native-libraries-in-hbase",content:"So in this case, the PLATFORM string is `Linux-amd64-64`.\nCopying the Hadoop native libraries or symlinking at *lib/native/Linux-amd64-64* will ensure they are found.\nRolling restart after you have made this change."},{heading:"making-use-of-hadoop-native-libraries-in-hbase",content:`Here is an example of how you would set up the symlinks.
Let the hadoop and hbase installs be in your home directory. Assume your hadoop native libs
are at \\~/hadoop/lib/native. Assume you are on a Linux-amd64-64 platform. In this case,
you would do the following to link the hadoop native lib so hbase could find them.`},{heading:"making-use-of-hadoop-native-libraries-in-hbase",content:"If you see PureJavaCrc32C in a stack track or if you see something like the below in a perf trace, then native is not working; you are using the java CRC functions rather than native:"},{heading:"making-use-of-hadoop-native-libraries-in-hbase",content:`See HBASE-11927 Use Native Hadoop Library for HFile checksum (And flip default from CRC32 to CRC32C),
for more on native checksumming support. See in particular the release note for how to check if your hardware to see if your processor has support for hardware CRCs.
Or checkout the Apache Checksums in HBase blog post.`},{heading:"making-use-of-hadoop-native-libraries-in-hbase",content:"Here is example of how to point at the Hadoop libs with `LD_LIBRARY_PATH` environment variable:"},{heading:"making-use-of-hadoop-native-libraries-in-hbase",content:"Set in *hbase-env.sh* the LD\\_LIBRARY\\_PATH environment variable when starting your HBase."},{heading:"configure-hbase-for-compressors",content:`Compression codecs are provided either by HBase compressor modules or by Hadoop's native compression
support. As described above you choose a compression type in table or column family schema or in
site configuration using its short label, e.g. *snappy* for Snappy, or *zstd* for ZStandard. Which
codec implementation is dynamically loaded to support what label is configurable by way of site
configuration.`},{heading:"configure-hbase-for-compressors",content:"Algorithm label"},{heading:"configure-hbase-for-compressors",content:"Codec implementation configuration key"},{heading:"configure-hbase-for-compressors",content:"Default value"},{heading:"configure-hbase-for-compressors",content:"BROTLI"},{heading:"configure-hbase-for-compressors",content:"hbase.io.compress.brotli.codec"},{heading:"configure-hbase-for-compressors",content:"org.apache.hadoop.hbase.io.compress.brotli.BrotliCodec"},{heading:"configure-hbase-for-compressors",content:"BZIP2"},{heading:"configure-hbase-for-compressors",content:"hbase.io.compress.bzip2.codec"},{heading:"configure-hbase-for-compressors",content:"org.apache.hadoop.io.compress.BZip2Codec"},{heading:"configure-hbase-for-compressors",content:"GZ"},{heading:"configure-hbase-for-compressors",content:"hbase.io.compress.gz.codec"},{heading:"configure-hbase-for-compressors",content:"org.apache.hadoop.hbase.io.compress.ReusableStreamGzipCodec"},{heading:"configure-hbase-for-compressors",content:"LZ4"},{heading:"configure-hbase-for-compressors",content:"hbase.io.compress.lz4.codec"},{heading:"configure-hbase-for-compressors",content:"org.apache.hadoop.io.compress.Lz4Codec"},{heading:"configure-hbase-for-compressors",content:"LZMA"},{heading:"configure-hbase-for-compressors",content:"hbase.io.compress.lzma.codec"},{heading:"configure-hbase-for-compressors",content:"org.apache.hadoop.hbase.io.compress.xz.LzmaCodec"},{heading:"configure-hbase-for-compressors",content:"LZO"},{heading:"configure-hbase-for-compressors",content:"hbase.io.compress.lzo.codec"},{heading:"configure-hbase-for-compressors",content:"com.hadoop.compression.lzo.LzoCodec"},{heading:"configure-hbase-for-compressors",content:"SNAPPY"},{heading:"configure-hbase-for-compressors",content:"hbase.io.compress.snappy.codec"},{heading:"configure-hbase-for-compressors",content:"org.apache.hadoop.io.compress.SnappyCodec"},{heading:"configure-hbase-for-compressors",content:"ZSTD"},{heading:"configure-hbase-for-compressors",content:"hbase.io.compress.zstd.codec"},{heading:"configure-hbase-for-compressors",content:"org.apache.hadoop.io.compress.ZStandardCodec"},{heading:"configure-hbase-for-compressors",content:"The available codec implementation options are:"},{heading:"configure-hbase-for-compressors",content:"Label"},{heading:"configure-hbase-for-compressors",content:"Codec implementation class"},{heading:"configure-hbase-for-compressors",content:"Notes"},{heading:"configure-hbase-for-compressors",content:"BROTLI"},{heading:"configure-hbase-for-compressors",content:"org.apache.hadoop.hbase.io.compress.brotli.BrotliCodec"},{heading:"configure-hbase-for-compressors",content:"Implemented with Brotli4j"},{heading:"configure-hbase-for-compressors",content:"BZIP2"},{heading:"configure-hbase-for-compressors",content:"org.apache.hadoop.io.compress.BZip2Codec"},{heading:"configure-hbase-for-compressors",content:"Hadoop native codec"},{heading:"configure-hbase-for-compressors",content:"GZ"},{heading:"configure-hbase-for-compressors",content:"org.apache.hadoop.hbase.io.compress.ReusableStreamGzipCodec"},{heading:"configure-hbase-for-compressors",content:"Requires the Hadoop native GZ codec"},{heading:"configure-hbase-for-compressors",content:"LZ4"},{heading:"configure-hbase-for-compressors",content:"org.apache.hadoop.io.compress.Lz4Codec"},{heading:"configure-hbase-for-compressors",content:"Hadoop native codec"},{heading:"configure-hbase-for-compressors",content:"LZ4"},{heading:"configure-hbase-for-compressors",content:"org.apache.hadoop.hbase.io.compress.aircompressor.Lz4Codec"},{heading:"configure-hbase-for-compressors",content:"Pure Java implementation"},{heading:"configure-hbase-for-compressors",content:"LZ4"},{heading:"configure-hbase-for-compressors",content:"org.apache.hadoop.hbase.io.compress.lz4.Lz4Codec"},{heading:"configure-hbase-for-compressors",content:"Implemented with lz4-java"},{heading:"configure-hbase-for-compressors",content:"LZMA"},{heading:"configure-hbase-for-compressors",content:"org.apache.hadoop.hbase.io.compress.xz.LzmaCodec"},{heading:"configure-hbase-for-compressors",content:"Implemented with XZ For Java"},{heading:"configure-hbase-for-compressors",content:"LZO"},{heading:"configure-hbase-for-compressors",content:"com.hadoop.compression.lzo.LzoCodec"},{heading:"configure-hbase-for-compressors",content:"Hadoop native codec, requires GPL licensed native dependencies"},{heading:"configure-hbase-for-compressors",content:"LZO"},{heading:"configure-hbase-for-compressors",content:"org.apache.hadoop.io.compress.LzoCodec"},{heading:"configure-hbase-for-compressors",content:"Hadoop native codec, requires GPL licensed native dependencies"},{heading:"configure-hbase-for-compressors",content:"LZO"},{heading:"configure-hbase-for-compressors",content:"org.apache.hadoop.hbase.io.compress.aircompressor.LzoCodec"},{heading:"configure-hbase-for-compressors",content:"Pure Java implementation"},{heading:"configure-hbase-for-compressors",content:"SNAPPY"},{heading:"configure-hbase-for-compressors",content:"org.apache.hadoop.io.compress.SnappyCodec"},{heading:"configure-hbase-for-compressors",content:"Hadoop native codec"},{heading:"configure-hbase-for-compressors",content:"SNAPPY"},{heading:"configure-hbase-for-compressors",content:"org.apache.hadoop.hbase.io.compress.aircompressor.SnappyCodec"},{heading:"configure-hbase-for-compressors",content:"Pure Java implementation"},{heading:"configure-hbase-for-compressors",content:"SNAPPY"},{heading:"configure-hbase-for-compressors",content:"org.apache.hadoop.hbase.io.compress.xerial.SnappyCodec"},{heading:"configure-hbase-for-compressors",content:"Implemented with snappy-java"},{heading:"configure-hbase-for-compressors",content:"ZSTD"},{heading:"configure-hbase-for-compressors",content:"org.apache.hadoop.io.compress.ZStandardCodec"},{heading:"configure-hbase-for-compressors",content:"Hadoop native codec"},{heading:"configure-hbase-for-compressors",content:"ZSTD"},{heading:"configure-hbase-for-compressors",content:"org.apache.hadoop.hbase.io.compress.aircompressor.ZstdCodec"},{heading:"configure-hbase-for-compressors",content:"Pure Java implementation, limited to a fixed compression level, not data compatible with the Hadoop zstd codec"},{heading:"configure-hbase-for-compressors",content:"ZSTD"},{heading:"configure-hbase-for-compressors",content:"org.apache.hadoop.hbase.io.compress.zstd.ZstdCodec"},{heading:"configure-hbase-for-compressors",content:"Implemented with zstd-jni, supports all compression levels, supports custom dictionaries"},{heading:"configure-hbase-for-compressors",content:`Specify which codec implementation option you prefer for a given compression algorithm
in site configuration, like so:`},{heading:"compressor-microbenchmarks",content:"See https\\://github.com/apurtell/jmh-compression-tests"},{heading:"compressor-microbenchmarks",content:`256MB (258,126,022 bytes exactly) of block data was extracted from two HFiles containing Common
Crawl data ingested using IntegrationLoadTestCommonCrawl, 2,680 blocks in total. This data was
processed by each new codec implementation as if the block data were being compressed again for
write into an HFile, but without writing any data, comparing only the CPU time and resource demand
of the codec itself. Absolute performance numbers will vary depending on hardware and software
particulars of your deployment. The relative differences are what are interesting. Measured time
is the average time in milliseconds required to compress all blocks of the 256MB file. This is
how long it would take to write the HFile containing these contents, minus the I/O overhead of
block encoding and actual persistence.`},{heading:"compressor-microbenchmarks",content:"These are the results:"},{heading:"compressor-microbenchmarks",content:"Codec"},{heading:"compressor-microbenchmarks",content:"Level"},{heading:"compressor-microbenchmarks",content:"Time (milliseconds)"},{heading:"compressor-microbenchmarks",content:"Result (bytes)"},{heading:"compressor-microbenchmarks",content:"Improvement"},{heading:"compressor-microbenchmarks",content:"AirCompressor LZ4"},{heading:"compressor-microbenchmarks",content:"-"},{heading:"compressor-microbenchmarks",content:"349.989 ± 2.835"},{heading:"compressor-microbenchmarks",content:"76,999,408"},{heading:"compressor-microbenchmarks",content:"70.17%"},{heading:"compressor-microbenchmarks",content:"AirCompressor LZO"},{heading:"compressor-microbenchmarks",content:"-"},{heading:"compressor-microbenchmarks",content:"334.554 ± 3.243"},{heading:"compressor-microbenchmarks",content:"79,369,805"},{heading:"compressor-microbenchmarks",content:"69.25%"},{heading:"compressor-microbenchmarks",content:"AirCompressor Snappy"},{heading:"compressor-microbenchmarks",content:"-"},{heading:"compressor-microbenchmarks",content:"364.153 ± 19.718"},{heading:"compressor-microbenchmarks",content:"80,201,763"},{heading:"compressor-microbenchmarks",content:"68.93%"},{heading:"compressor-microbenchmarks",content:"AirCompressor Zstandard"},{heading:"compressor-microbenchmarks",content:"3 (effective)"},{heading:"compressor-microbenchmarks",content:"1108.267 ± 8.969"},{heading:"compressor-microbenchmarks",content:"55,129,189"},{heading:"compressor-microbenchmarks",content:"78.64%"},{heading:"compressor-microbenchmarks",content:"Brotli"},{heading:"compressor-microbenchmarks",content:"1"},{heading:"compressor-microbenchmarks",content:"593.107 ± 2.376"},{heading:"compressor-microbenchmarks",content:"58,672,319"},{heading:"compressor-microbenchmarks",content:"77.27%"},{heading:"compressor-microbenchmarks",content:"Brotli"},{heading:"compressor-microbenchmarks",content:"3"},{heading:"compressor-microbenchmarks",content:"1345.195 ± 27.327"},{heading:"compressor-microbenchmarks",content:"53,917,438"},{heading:"compressor-microbenchmarks",content:"79.11%"},{heading:"compressor-microbenchmarks",content:"Brotli"},{heading:"compressor-microbenchmarks",content:"6"},{heading:"compressor-microbenchmarks",content:"2812.411 ± 25.372"},{heading:"compressor-microbenchmarks",content:"48,696,441"},{heading:"compressor-microbenchmarks",content:"81.13%"},{heading:"compressor-microbenchmarks",content:"Brotli"},{heading:"compressor-microbenchmarks",content:"10"},{heading:"compressor-microbenchmarks",content:"74615.936 ± 224.854"},{heading:"compressor-microbenchmarks",content:"44,970,710"},{heading:"compressor-microbenchmarks",content:"82.58%"},{heading:"compressor-microbenchmarks",content:"LZ4 (lz4-java)"},{heading:"compressor-microbenchmarks",content:"-"},{heading:"compressor-microbenchmarks",content:"303.045 ± 0.783"},{heading:"compressor-microbenchmarks",content:"76,974,364"},{heading:"compressor-microbenchmarks",content:"70.18%"},{heading:"compressor-microbenchmarks",content:"LZMA"},{heading:"compressor-microbenchmarks",content:"1"},{heading:"compressor-microbenchmarks",content:"6410.428 ± 115.065"},{heading:"compressor-microbenchmarks",content:"49,948,535"},{heading:"compressor-microbenchmarks",content:"80.65%"},{heading:"compressor-microbenchmarks",content:"LZMA"},{heading:"compressor-microbenchmarks",content:"3"},{heading:"compressor-microbenchmarks",content:"8144.620 ± 152.119"},{heading:"compressor-microbenchmarks",content:"49,109,363"},{heading:"compressor-microbenchmarks",content:"80.97%"},{heading:"compressor-microbenchmarks",content:"LZMA"},{heading:"compressor-microbenchmarks",content:"6"},{heading:"compressor-microbenchmarks",content:"43802.576 ± 382.025"},{heading:"compressor-microbenchmarks",content:"46,951,810"},{heading:"compressor-microbenchmarks",content:"81.81%"},{heading:"compressor-microbenchmarks",content:"LZMA"},{heading:"compressor-microbenchmarks",content:"9"},{heading:"compressor-microbenchmarks",content:"49821.979 ± 580.110"},{heading:"compressor-microbenchmarks",content:"46,951,810"},{heading:"compressor-microbenchmarks",content:"81.81%"},{heading:"compressor-microbenchmarks",content:"Snappy (xerial)"},{heading:"compressor-microbenchmarks",content:"-"},{heading:"compressor-microbenchmarks",content:"360.225 ± 2.324"},{heading:"compressor-microbenchmarks",content:"80,749,937"},{heading:"compressor-microbenchmarks",content:"68.72%"},{heading:"compressor-microbenchmarks",content:"Zstd (zstd-jni)"},{heading:"compressor-microbenchmarks",content:"1"},{heading:"compressor-microbenchmarks",content:"654.699 ± 16.839"},{heading:"compressor-microbenchmarks",content:"56,719,994"},{heading:"compressor-microbenchmarks",content:"78.03%"},{heading:"compressor-microbenchmarks",content:"Zstd (zstd-jni)"},{heading:"compressor-microbenchmarks",content:"3"},{heading:"compressor-microbenchmarks",content:"839.160 ± 24.906"},{heading:"compressor-microbenchmarks",content:"54,573,095"},{heading:"compressor-microbenchmarks",content:"78.86%"},{heading:"compressor-microbenchmarks",content:"Zstd (zstd-jni)"},{heading:"compressor-microbenchmarks",content:"5"},{heading:"compressor-microbenchmarks",content:"1594.373 ± 22.384"},{heading:"compressor-microbenchmarks",content:"52,025,485"},{heading:"compressor-microbenchmarks",content:"79.84%"},{heading:"compressor-microbenchmarks",content:"Zstd (zstd-jni)"},{heading:"compressor-microbenchmarks",content:"7"},{heading:"compressor-microbenchmarks",content:"2308.705 ± 24.744"},{heading:"compressor-microbenchmarks",content:"50,651,554"},{heading:"compressor-microbenchmarks",content:"80.38%"},{heading:"compressor-microbenchmarks",content:"Zstd (zstd-jni)"},{heading:"compressor-microbenchmarks",content:"9"},{heading:"compressor-microbenchmarks",content:"3659.677 ± 58.018"},{heading:"compressor-microbenchmarks",content:"50,208,425"},{heading:"compressor-microbenchmarks",content:"80.55%"},{heading:"compressor-microbenchmarks",content:"Zstd (zstd-jni)"},{heading:"compressor-microbenchmarks",content:"12"},{heading:"compressor-microbenchmarks",content:"8705.294 ± 58.080"},{heading:"compressor-microbenchmarks",content:"49,841,446"},{heading:"compressor-microbenchmarks",content:"80.69%"},{heading:"compressor-microbenchmarks",content:"Zstd (zstd-jni)"},{heading:"compressor-microbenchmarks",content:"15"},{heading:"compressor-microbenchmarks",content:"19785.646 ± 278.080"},{heading:"compressor-microbenchmarks",content:"48,499,508"},{heading:"compressor-microbenchmarks",content:"81.21%"},{heading:"compressor-microbenchmarks",content:"Zstd (zstd-jni)"},{heading:"compressor-microbenchmarks",content:"18"},{heading:"compressor-microbenchmarks",content:"47702.097 ± 442.670"},{heading:"compressor-microbenchmarks",content:"48,319,879"},{heading:"compressor-microbenchmarks",content:"81.28%"},{heading:"compressor-microbenchmarks",content:"Zstd (zstd-jni)"},{heading:"compressor-microbenchmarks",content:"22"},{heading:"compressor-microbenchmarks",content:"97799.695 ± 1106.571"},{heading:"compressor-microbenchmarks",content:"48,212,220"},{heading:"compressor-microbenchmarks",content:"81.32%"},{heading:"compressor-support-on-the-master",content:"A new configuration setting was introduced in HBase 0.95, to check the Master to determine which data block encoders are installed and configured on it, and assume that the entire cluster is configured the same.\nThis option, `hbase.master.check.compression`, defaults to `true`.\nThis prevents the situation described in HBASE-6370, where a table is created or modified to support a codec that a region server does not support, leading to failures that take a long time to occur and are difficult to debug."},{heading:"compressor-support-on-the-master",content:"If `hbase.master.check.compression` is enabled, libraries for all desired compressors need to be installed and configured on the Master, even if the Master does not run a region server."},{heading:"install-gz-support-via-native-libraries",content:"HBase uses Java's built-in GZip support unless the native Hadoop libraries are available on the CLASSPATH.\nThe recommended way to add libraries to the CLASSPATH is to set the environment variable `HBASE_LIBRARY_PATH` for the user running HBase.\nIf native libraries are not available and Java's GZIP is used, `Got brand-new compressor` reports will be present in the logs.\nSee brand.new\\.compressor)."},{heading:"install-hadoop-native-lzo-support",content:`HBase cannot ship with the Hadoop native LZO codc because of incompatibility between HBase, which uses an Apache Software License (ASL) and LZO, which uses a GPL license.
See the Hadoop-LZO at Twitter for information on configuring LZO support for HBase.`},{heading:"install-hadoop-native-lzo-support",content:`If you depend upon LZO compression, consider using the pure Java and ASL licensed
AirCompressor LZO codec option instead of the Hadoop native default, or configure your
RegionServers to fail to start if native LZO support is not available.
See hbase.regionserver.codecs.`},{heading:"configure-hadoop-native-lz4-support",content:`LZ4 support is bundled with Hadoop and is the default LZ4 codec implementation.
It is not required that you make use of the Hadoop LZ4 codec. Our LZ4 codec implemented
with lz4-java offers superior performance, and the AirCompressor LZ4 codec offers a
pure Java option for use where native support is not available.`},{heading:"configure-hadoop-native-lz4-support",content:`That said, if you prefer the Hadoop option, make sure the hadoop shared library
(libhadoop.so) is accessible when you start HBase.
After configuring your platform (see hadoop.native.lib), you can
make a symbolic link from HBase to the native Hadoop libraries. This assumes the two
software installs are colocated. For example, if my 'platform' is Linux-amd64-64:`},{heading:"configure-hadoop-native-lz4-support",content:`Use the compression tool to check that LZ4 is installed on all nodes.
Start up (or restart) HBase.
Afterward, you can create and alter tables to enable LZ4 as a compression codec.:`},{heading:"install-hadoop-native-snappy-support",content:`Snappy support is bundled with Hadoop and is the default Snappy codec implementation.
It is not required that you make use of the Hadoop Snappy codec. Our Snappy codec
implemented with Xerial Snappy offers superior performance, and the AirCompressor
Snappy codec offers a pure Java option for use where native support is not available.`},{heading:"install-hadoop-native-snappy-support",content:`That said, if you prefer the Hadoop codec option, you can install Snappy binaries (for
instance, by using +yum install snappy+ on CentOS) or build Snappy from source.
After installing Snappy, search for the shared library, which will be called *libsnappy.so.X&#x2A; where X is a number.
If you built from source, copy the shared library to a known location on your system, such as &#x2A;/opt/snappy/lib/*.`},{heading:"install-hadoop-native-snappy-support",content:`In addition to the Snappy library, HBase also needs access to the Hadoop shared library, which will be called something like *libhadoop.so.X.Y*, where X and Y are both numbers.
Make note of the location of the Hadoop library, or copy it to the same location as the Snappy library.`},{heading:"install-hadoop-native-snappy-support",content:`The Snappy and Hadoop libraries need to be available on each node of your cluster.
See compression.test to find out how to test that this is the case.`},{heading:"install-hadoop-native-snappy-support",content:"See hbase.regionserver.codecs to configure your RegionServers to fail to start if a given compressor is not available."},{heading:"install-hadoop-native-snappy-support",content:"Each of these library locations need to be added to the environment variable `HBASE_LIBRARY_PATH` for the operating system user that runs HBase.\nYou need to restart the RegionServer for the changes to take effect."},{heading:"compressiontest",content:"You can use the CompressionTest tool to verify that your compressor is available to HBase:"},{heading:"enforce-compression-settings-on-a-regionserver",content:"You can configure a RegionServer so that it will fail to restart if compression is configured incorrectly, by adding the option hbase.regionserver.codecs to the *hbase-site.xml*, and setting its value to a comma-separated list of codecs that need to be available.\nFor example, if you set this property to `lzo,gz`, the RegionServer would fail to start if both compressors were not available.\nThis would prevent a new server from being added to the cluster without having codecs configured properly."},{heading:"enable-compression-on-a-columnfamily",content:"To enable compression for a ColumnFamily, use an `alter` command.\nYou do not need to re-create the table or copy data.\nIf you are changing codecs, be sure the old codec is still available until all the old StoreFiles have been compacted."},{heading:"testing-compression-performance",content:"HBase includes a tool called LoadTestTool which provides mechanisms to test your compression performance.\nYou must specify either `-write` or `-update-read` as your first parameter, and if you do not specify another parameter, usage advice is printed for each option."},{heading:"testing-compression-performance",content:"**`LoadTestTool` Usage**"},{heading:"enable-data-block-encoding",content:`Codecs are built into HBase so no extra configuration is needed.
Codecs are enabled on a table by setting the \`DATA_BLOCK_ENCODING\` property.
Disable the table before altering its DATA\\_BLOCK\\_ENCODING setting.
Following is an example using HBase Shell:`}],headings:[{id:"changes-take-effect-upon-compaction",content:"Changes Take Effect Upon Compaction"},{id:"block-compressors",content:"Block Compressors"},{id:"data-block-encoding-types",content:"Data Block Encoding Types"},{id:"prefix",content:"Prefix"},{id:"diff",content:"Diff"},{id:"fast-diff",content:"Fast Diff"},{id:"prefix-tree",content:"Prefix Tree"},{id:"which-compressor-or-data-block-encoder-to-use",content:"Which Compressor or Data Block Encoder To Use"},{id:"making-use-of-hadoop-native-libraries-in-hbase",content:"Making use of Hadoop Native Libraries in HBase"},{id:"compressor-configuration-installation-and-use",content:"Compressor Configuration, Installation, and Use"},{id:"configure-hbase-for-compressors",content:"Configure HBase For Compressors"},{id:"compressor-microbenchmarks",content:"Compressor Microbenchmarks"},{id:"compressor-support-on-the-master",content:"Compressor Support On the Master"},{id:"install-gz-support-via-native-libraries",content:"Install GZ Support Via Native Libraries"},{id:"install-hadoop-native-lzo-support",content:"Install Hadoop Native LZO Support"},{id:"configure-hadoop-native-lz4-support",content:"Configure Hadoop Native LZ4 Support"},{id:"install-hadoop-native-snappy-support",content:"Install Hadoop native Snappy Support"},{id:"compressiontest",content:"CompressionTest"},{id:"enforce-compression-settings-on-a-regionserver",content:"Enforce Compression Settings On a RegionServer"},{id:"enable-compression-on-a-columnfamily",content:"Enable Compression On a ColumnFamily"},{id:"enabling-compression-on-a-columnfamily-of-an-existing-table-using-hbaseshell",content:"Enabling Compression on a ColumnFamily of an Existing Table using HBaseShell"},{id:"creating-a-new-table-with-compression-on-a-columnfamily",content:"Creating a New Table with Compression On a ColumnFamily"},{id:"verifying-a-columnfamilys-compression-settings",content:"Verifying a ColumnFamily's Compression Settings"},{id:"testing-compression-performance",content:"Testing Compression Performance"},{id:"example-usage-of-loadtesttool",content:"Example Usage of LoadTestTool"},{id:"enable-data-block-encoding",content:"Enable Data Block Encoding"},{id:"enable-data-block-encoding-on-a-table",content:"Enable Data Block Encoding On a Table"},{id:"verifying-a-columnfamilys-data-block-encoding",content:"Verifying a ColumnFamily's Data Block Encoding"}]},g=[{depth:2,url:"#changes-take-effect-upon-compaction",title:e.jsx(e.Fragment,{children:"Changes Take Effect Upon Compaction"})},{depth:2,url:"#block-compressors",title:e.jsx(e.Fragment,{children:"Block Compressors"})},{depth:2,url:"#data-block-encoding-types",title:e.jsx(e.Fragment,{children:"Data Block Encoding Types"})},{depth:3,url:"#prefix",title:e.jsx(e.Fragment,{children:"Prefix"})},{depth:3,url:"#diff",title:e.jsx(e.Fragment,{children:"Diff"})},{depth:3,url:"#fast-diff",title:e.jsx(e.Fragment,{children:"Fast Diff"})},{depth:3,url:"#prefix-tree",title:e.jsx(e.Fragment,{children:"Prefix Tree"})},{depth:2,url:"#which-compressor-or-data-block-encoder-to-use",title:e.jsx(e.Fragment,{children:"Which Compressor or Data Block Encoder To Use"})},{depth:2,url:"#making-use-of-hadoop-native-libraries-in-hbase",title:e.jsx(e.Fragment,{children:"Making use of Hadoop Native Libraries in HBase"})},{depth:2,url:"#compressor-configuration-installation-and-use",title:e.jsx(e.Fragment,{children:"Compressor Configuration, Installation, and Use"})},{depth:3,url:"#configure-hbase-for-compressors",title:e.jsx(e.Fragment,{children:"Configure HBase For Compressors"})},{depth:4,url:"#compressor-microbenchmarks",title:e.jsx(e.Fragment,{children:"Compressor Microbenchmarks"})},{depth:4,url:"#compressor-support-on-the-master",title:e.jsx(e.Fragment,{children:"Compressor Support On the Master"})},{depth:4,url:"#install-gz-support-via-native-libraries",title:e.jsx(e.Fragment,{children:"Install GZ Support Via Native Libraries"})},{depth:4,url:"#install-hadoop-native-lzo-support",title:e.jsx(e.Fragment,{children:"Install Hadoop Native LZO Support"})},{depth:4,url:"#configure-hadoop-native-lz4-support",title:e.jsx(e.Fragment,{children:"Configure Hadoop Native LZ4 Support"})},{depth:4,url:"#install-hadoop-native-snappy-support",title:e.jsx(e.Fragment,{children:"Install Hadoop native Snappy Support"})},{depth:4,url:"#compressiontest",title:e.jsx(e.Fragment,{children:"CompressionTest"})},{depth:4,url:"#enforce-compression-settings-on-a-regionserver",title:e.jsx(e.Fragment,{children:"Enforce Compression Settings On a RegionServer"})},{depth:3,url:"#enable-compression-on-a-columnfamily",title:e.jsx(e.Fragment,{children:"Enable Compression On a ColumnFamily"})},{depth:4,url:"#enabling-compression-on-a-columnfamily-of-an-existing-table-using-hbaseshell",title:e.jsx(e.Fragment,{children:"Enabling Compression on a ColumnFamily of an Existing Table using HBaseShell"})},{depth:4,url:"#creating-a-new-table-with-compression-on-a-columnfamily",title:e.jsx(e.Fragment,{children:"Creating a New Table with Compression On a ColumnFamily"})},{depth:4,url:"#verifying-a-columnfamilys-compression-settings",title:e.jsx(e.Fragment,{children:"Verifying a ColumnFamily's Compression Settings"})},{depth:3,url:"#testing-compression-performance",title:e.jsx(e.Fragment,{children:"Testing Compression Performance"})},{depth:4,url:"#example-usage-of-loadtesttool",title:e.jsx(e.Fragment,{children:"Example Usage of LoadTestTool"})},{depth:2,url:"#enable-data-block-encoding",title:e.jsx(e.Fragment,{children:"Enable Data Block Encoding"})},{depth:4,url:"#enable-data-block-encoding-on-a-table",title:e.jsx(e.Fragment,{children:"Enable Data Block Encoding On a Table"})},{depth:4,url:"#verifying-a-columnfamilys-data-block-encoding",title:e.jsx(e.Fragment,{children:"Verifying a ColumnFamily's Data Block Encoding"})}];function a(s){const i={a:"a",br:"br",code:"code",em:"em",h2:"h2",h3:"h3",h4:"h4",img:"img",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...s.components},{Callout:n}=i;return n||h("Callout"),e.jsxs(e.Fragment,{children:[e.jsx(n,{type:"info",children:e.jsxs(i.p,{children:[`Codecs mentioned in this section are for encoding and decoding data blocks or row keys. For
information about replication codecs, see
`,e.jsx(i.a,{href:"/docs/operational-management/cluster-replication#life-of-a-wal-edit",children:"cluster.replication.preserving.tags"}),"."]})}),`
`,e.jsx(i.p,{children:`HBase supports several different compression algorithms which can be enabled on a ColumnFamily.
Data block encoding attempts to limit duplication of information in keys, taking advantage of some of the fundamental designs and patterns of HBase, such as sorted row keys and the schema of a given table.
Compressors reduce the size of large, opaque byte arrays in cells, and can significantly reduce the storage space needed to store uncompressed data.`}),`
`,e.jsx(i.p,{children:"Compressors and data block encoding can be used together on the same ColumnFamily."}),`
`,e.jsx(i.h2,{id:"changes-take-effect-upon-compaction",children:"Changes Take Effect Upon Compaction"}),`
`,e.jsx(i.p,{children:"If you change compression or encoding for a ColumnFamily, the changes take effect during compaction."}),`
`,e.jsxs(i.p,{children:[`Some codecs take advantage of capabilities built into Java, such as GZip compression.
Others rely on native libraries. Native libraries may be available via codec dependencies installed into
HBase's library directory, or, if you are utilizing Hadoop codecs, as part of Hadoop. Hadoop codecs
typically have a native code component so follow instructions for installing Hadoop native binary
support at `,e.jsx(i.a,{href:"/docs/compression#making-use-of-hadoop-native-libraries-in-hbase",children:"Making use of Hadoop Native Libraries in HBase"}),"."]}),`
`,e.jsx(i.p,{children:"This section discusses common codecs that are used and tested with HBase."}),`
`,e.jsxs(i.p,{children:[`No matter what codec you use, be sure to test that it is installed correctly and is available on all nodes in your cluster.
Extra operational steps may be necessary to be sure that codecs are available on newly-deployed nodes.
You can use the `,e.jsx(i.a,{href:"/docs/compression#compressiontest",children:"compression.test"})," utility to check that a given codec is correctly installed."]}),`
`,e.jsxs(i.p,{children:["To configure HBase to use a compressor, see ",e.jsx(i.a,{href:"/docs/compression#compressor-configuration-installation-and-use",children:"compressor.install"}),`.
To enable a compressor for a ColumnFamily, see `,e.jsx(i.a,{href:"/docs/compression#enable-compression-on-a-columnfamily",children:"changing.compression"}),`.
To enable data block encoding for a ColumnFamily, see `,e.jsx(i.a,{href:"/docs/compression#enable-data-block-encoding",children:"data.block.encoding.enable"}),"."]}),`
`,e.jsx(i.h2,{id:"block-compressors",children:"Block Compressors"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"NONE"}),e.jsx(i.br,{}),`
`,"This compression type constant selects no compression, and is the default."]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"BROTLI"}),e.jsx(i.br,{}),`
`,e.jsx(i.a,{href:"https://en.wikipedia.org/wiki/Brotli",children:"Brotli"}),` is a generic-purpose lossless compression algorithm
that compresses data using a combination of a modern variant of the LZ77 algorithm, Huffman
coding, and 2nd order context modeling, with a compression ratio comparable to the best currently
available general-purpose compression methods. It is similar in speed with GZ but offers more
dense compression.`]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"BZIP2"}),e.jsx(i.br,{}),`
`,e.jsx(i.a,{href:"https://en.wikipedia.org/wiki/Bzip2",children:"Bzip2"}),` compresses files using the Burrows-Wheeler block
sorting text compression algorithm and Huffman coding. Compression is generally considerably
better than that achieved by the dictionary- (LZ-) based compressors, but both compression and
decompression can be slow in comparison to other options.`]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"GZ"}),e.jsx(i.br,{}),`
`,"gzip is based on the ",e.jsx(i.a,{href:"https://en.wikipedia.org/wiki/Deflate",children:"DEFLATE"}),` algorithm, which is a
combination of LZ77 and Huffman coding. It is universally available in the Java Runtime
Environment so is a good lowest common denominator option. However in comparison to more modern
algorithms like Zstandard it is quite slow.`]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"LZ4"}),e.jsx(i.br,{}),`
`,e.jsx(i.a,{href:"https://en.wikipedia.org/wiki/LZ4_(compression_algorithm)",children:"LZ4"}),` is a lossless data compression
algorithm that is focused on compression and decompression speed. It belongs to the LZ77 family
of compression algorithms, like Brotli, DEFLATE, Zstandard, and others. In our microbenchmarks
LZ4 is the fastest option for both compression and decompression in that family, and is our
universally recommended option.`]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"LZMA"}),e.jsx(i.br,{}),`
`,e.jsx(i.a,{href:"https://en.wikipedia.org/wiki/Lempel%E2%80%93Ziv%E2%80%93Markov_chain_algorithm",children:"LZMA"}),` is a
dictionary compression scheme somewhat similar to the LZ77 algorithm that achieves very high
compression ratios with a computationally expensive predictive model and variable size
compression dictionary, while still maintaining decompression speed similar to other commonly used
compression algorithms. LZMA is superior to all other options in general compression ratio but as
a compressor it can be extremely slow, especially when configured to operate at higher levels of
compression.`]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"LZO"}),e.jsx(i.br,{}),`
`,e.jsx(i.a,{href:"https://en.wikipedia.org/wiki/Lempel%E2%80%93Ziv%E2%80%93Oberhumer",children:"LZO"}),` is another LZ-variant
data compression algorithm, with an implementation focused on decompression speed. It is almost
but not quite as fast as LZ4.`]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"SNAPPY"}),e.jsx(i.br,{}),`
`,e.jsx(i.a,{href:"https://en.wikipedia.org/wiki/Snappy_(compression)",children:"Snappy"}),` is based on ideas from LZ77 but is
optimized for very high compression speed, achieving only a "reasonable" compression in trade.
It is as fast as LZ4 but does not compress quite as well. We offer a pure Java Snappy codec
that can be used instead of GZ as the universally available option for any Java runtime on any
hardware architecture.`]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.strong,{children:"ZSTD"}),e.jsx(i.br,{}),`
`,e.jsx(i.a,{href:"https://en.wikipedia.org/wiki/Zstd",children:"Zstandard"}),` combines a dictionary-matching stage (LZ77) with
a large search window and a fast entropy coding stage, using both Finite State Entropy and
Huffman coding. Compression speed can vary by a factor of 20 or more between the fastest and
slowest levels, while decompression is uniformly fast, varying by less than 20% between the
fastest and slowest levels.`,e.jsx(i.br,{}),`
`,`ZStandard is the most flexible of the available compression codec options, offering a compression
ratio similar to LZ4 at level 1 (but with slightly less performance), compression ratios
comparable to DEFLATE at mid levels (but with better performance), and LZMA-alike dense
compression (and LZMA-alike compression speeds) at high levels; while providing universally fast
decompression.`]}),`
`]}),`
`,e.jsx(i.h2,{id:"data-block-encoding-types",children:"Data Block Encoding Types"}),`
`,e.jsx(i.h3,{id:"prefix",children:"Prefix"}),`
`,e.jsxs(i.p,{children:["Often, keys are very similar. Specifically, keys often share a common prefix and only differ near the end. For instance, one key might be ",e.jsx(i.code,{children:"RowKey:Family:Qualifier0"})," and the next key might be ",e.jsx(i.code,{children:"RowKey:Family:Qualifier1"}),`.
In Prefix encoding, an extra column is added which holds the length of the prefix shared between the current key and the previous key. Assuming the first key here is totally different from the key before, its prefix length is 0.`]}),`
`,e.jsxs(i.p,{children:["The second key's prefix length is ",e.jsx(i.code,{children:"23"}),", since they have the first 23 characters in common."]}),`
`,e.jsx(i.p,{children:"Obviously if the keys tend to have nothing in common, Prefix will not provide much benefit."}),`
`,e.jsx(i.p,{children:"The following image shows a hypothetical ColumnFamily with no data block encoding."}),`
`,e.jsx(i.p,{children:e.jsx(i.img,{alt:"ColumnFamily with No Encoding",src:o})}),`
`,e.jsx(i.p,{children:"Here is the same data with prefix data encoding."}),`
`,e.jsx(i.p,{children:e.jsx(i.img,{alt:"ColumnFamily with Prefix Encoding",src:t})}),`
`,e.jsx(i.h3,{id:"diff",children:"Diff"}),`
`,e.jsx(i.p,{children:`Diff encoding expands upon Prefix encoding.
Instead of considering the key sequentially as a monolithic series of bytes, each key field is split so that each part of the key can be compressed more efficiently.`}),`
`,e.jsx(i.p,{children:"Two new fields are added: timestamp and type."}),`
`,e.jsx(i.p,{children:"If the ColumnFamily is the same as the previous row, it is omitted from the current row."}),`
`,e.jsx(i.p,{children:"If the key length, value length or type are the same as the previous row, the field is omitted."}),`
`,e.jsx(i.p,{children:`In addition, for increased compression, the timestamp is stored as a Diff from the previous row's timestamp, rather than being stored in full.
Given the two row keys in the Prefix example, and given an exact match on timestamp and the same type, neither the value length, or type needs to be stored for the second row, and the timestamp value for the second row is just 0, rather than a full timestamp.`}),`
`,e.jsx(i.p,{children:"Diff encoding is disabled by default because writing and scanning are slower but more data is cached."}),`
`,e.jsx(i.p,{children:"This image shows the same ColumnFamily from the previous images, with Diff encoding."}),`
`,e.jsx(i.p,{children:e.jsx(i.img,{alt:"ColumnFamily with Diff Encoding",src:r})}),`
`,e.jsx(i.h3,{id:"fast-diff",children:"Fast Diff"}),`
`,e.jsx(i.p,{children:"Fast Diff works similar to Diff, but uses a faster implementation. It also adds another field which stores a single bit to track whether the data itself is the same as the previous row. If it is, the data is not stored again."}),`
`,e.jsx(i.p,{children:"Fast Diff is the recommended codec to use if you have long keys or many columns."}),`
`,e.jsx(i.p,{children:"The data format is nearly identical to Diff encoding, so there is not an image to illustrate it."}),`
`,e.jsx(i.h3,{id:"prefix-tree",children:"Prefix Tree"}),`
`,e.jsx(i.p,{children:`Prefix tree encoding was introduced as an experimental feature in HBase 0.96.
It provides similar memory savings to the Prefix, Diff, and Fast Diff encoder, but provides faster random access at a cost of slower encoding speed.
It was removed in hbase-2.0.0. It was a good idea but little uptake. If interested in reviving this effort, write the hbase dev list.`}),`
`,e.jsx(i.h2,{id:"which-compressor-or-data-block-encoder-to-use",children:"Which Compressor or Data Block Encoder To Use"}),`
`,e.jsx(i.p,{children:"The compression or codec type to use depends on the characteristics of your data. Choosing the wrong type could cause your data to take more space rather than less, and can have performance implications."}),`
`,e.jsxs(i.p,{children:["In general, you need to weigh your options between smaller size and faster compression/decompression. Following are some general guidelines, expanded from a discussion at ",e.jsx(i.a,{href:"https://lists.apache.org/thread.html/481e67a61163efaaf4345510447a9244871a8d428244868345a155ff%401378926618%40%3Cdev.hbase.apache.org%3E",children:"Documenting Guidance on compression and codecs"}),"."]}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:`In most cases, enabling LZ4 or Snappy by default is a good choice, because they have a low
performance overhead and provide reasonable space savings. A fast compression algorithm almost
always improves overall system performance by trading some increased CPU usage for better I/O
efficiency.`}),`
`,e.jsx(i.li,{children:"If the values are large (and not pre-compressed, such as images), use a data block compressor."}),`
`,e.jsxs(i.li,{children:["For ",e.jsx(i.em,{children:"cold data"}),`, which is accessed infrequently, depending on your use case, it might
make sense to opt for Zstandard at its higher compression levels, or LZMA, especially for high
entropy binary data, or Brotli for data similar in characteristics to web data. Bzip2 might also
be a reasonable option but Zstandard is very likely to offer superior decompression speed.`]}),`
`,e.jsxs(i.li,{children:["For ",e.jsx(i.em,{children:"hot data"}),`, which is accessed frequently, you almost certainly want only LZ4,
Snappy, LZO, or Zstandard at a low compression level. These options will not provide as high of
a compression ratio but will in trade not unduly impact system performance.`]}),`
`,e.jsx(i.li,{children:`If you have long keys (compared to the values) or many columns, use a prefix encoder.
FAST_DIFF is recommended.`}),`
`,e.jsx(i.li,{children:`If enabling WAL value compression, consider LZ4 or SNAPPY compression, or Zstandard at
level 1. Reading and writing the WAL is performance critical. That said, the I/O
savings of these compression options can improve overall system performance.`}),`
`]}),`
`,e.jsx(i.h2,{id:"making-use-of-hadoop-native-libraries-in-hbase",children:"Making use of Hadoop Native Libraries in HBase"}),`
`,e.jsx(i.p,{children:`The Hadoop shared library has a bunch of facility including compression libraries and fast crc'ing — hardware crc'ing if your chipset supports it.
To make this facility available to HBase, do the following. HBase/Hadoop will fall back to use alternatives if it cannot find the native library
versions — or fail outright if you asking for an explicit compressor and there is no alternative available.`}),`
`,e.jsx(i.p,{children:"First make sure of your Hadoop. Fix this message if you are seeing it starting Hadoop processes:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"16/02/09 22:40:24 WARN util.NativeCodeLoader: Unable to load native-hadoop library for your platform... using builtin-java classes where applicable"})})})})}),`
`,e.jsx(i.p,{children:`It means is not properly pointing at its native libraries or the native libs were compiled for another platform.
Fix this first.`}),`
`,e.jsx(i.p,{children:"Then if you see the following in your HBase logs, you know that HBase was unable to locate the Hadoop native libraries:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"2014-08-07 09:26:20,139 WARN  [main] util.NativeCodeLoader: Unable to load native-hadoop library for your platform... using builtin-java classes where applicable"})})})})}),`
`,e.jsx(i.p,{children:"If the libraries loaded successfully, the WARN message does not show. Usually this means you are good to go but read on."}),`
`,e.jsx(i.p,{children:`Let's presume your Hadoop shipped with a native library that suits the platform you are running HBase on.
To check if the Hadoop native library is available to HBase, run the following tool (available in Hadoop 2.1 and greater):`}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ./bin/hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --config"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ~/conf_hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" org.apache.hadoop.util.NativeLibraryChecker"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"2014-08-26"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 13:15:38,717"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" WARN"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  [main] util.NativeCodeLoader: Unable to load native-hadoop library "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"for"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" your platform... using builtin-java classes where applicable"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Native"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" library"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" checking:"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hadoop:"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" false"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"zlib:"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"   false"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"snappy:"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" false"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"lz4:"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"    false"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"bzip2:"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"  false"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"2014-08-26"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 13:15:38,863"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" INFO"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  [main] util.ExitUtil: Exiting with status 1"})]})]})})}),`
`,e.jsx(i.p,{children:"Above shows that the native hadoop library is not available in HBase context."}),`
`,e.jsx(i.p,{children:`The above NativeLibraryChecker tool may come back saying all is hunky-dory
— i.e. all libs show 'true', that they are available — but follow the below
presecription anyways to ensure the native libs are available in HBase context,
when it goes to use them.`}),`
`,e.jsxs(i.p,{children:[`To fix the above, either copy the Hadoop native libraries local or symlink to them if the Hadoop and HBase stalls are adjacent in the filesystem.
You could also point at their location by setting the `,e.jsx(i.code,{children:"LD_LIBRARY_PATH"})," environment variable in your hbase-env.sh."]}),`
`,e.jsxs(i.p,{children:['Where the JVM looks to find native libraries is "system dependent" (See ',e.jsx(i.code,{children:"java.lang.System#loadLibrary(name)"}),"). On linux, by default, is going to look in ",e.jsx(i.em,{children:"lib/native/PLATFORM"})," where ",e.jsx(i.code,{children:"PLATFORM"}),` is the label for the platform your HBase is installed on.
On a local linux machine, it seems to be the concatenation of the java properties `,e.jsx(i.code,{children:"os.name"})," and ",e.jsx(i.code,{children:"os.arch"}),` followed by whether 32 or 64 bit.
HBase on startup prints out all of the java system properties so find the os.name and os.arch in the log.
For example:`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"..."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"2014-08-06 15:27:22,853 INFO  [main] zookeeper.ZooKeeper: Client environment:os.name=Linux"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"2014-08-06 15:27:22,853 INFO  [main] zookeeper.ZooKeeper: Client environment:os.arch=amd64"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"..."})})]})})}),`
`,e.jsxs(i.p,{children:["So in this case, the PLATFORM string is ",e.jsx(i.code,{children:"Linux-amd64-64"}),`.
Copying the Hadoop native libraries or symlinking at `,e.jsx(i.em,{children:"lib/native/Linux-amd64-64"}),` will ensure they are found.
Rolling restart after you have made this change.`]}),`
`,e.jsx(i.p,{children:`Here is an example of how you would set up the symlinks.
Let the hadoop and hbase installs be in your home directory. Assume your hadoop native libs
are at ~/hadoop/lib/native. Assume you are on a Linux-amd64-64 platform. In this case,
you would do the following to link the hadoop native lib so hbase could find them.`}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"..."})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" mkdir"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -p"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ~/hbaseLinux-amd64-64"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" -"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" /home/stack/hadoop/lib/native/lib/native/"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" cd"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ~/hbase/lib/native/"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ln"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -s"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ~/hadoop/lib/native"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Linux-amd64-64"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ls"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -la"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# Linux-amd64-64 -> /home/USER/hadoop/lib/native"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"..."})})]})})}),`
`,e.jsx(i.p,{children:"If you see PureJavaCrc32C in a stack track or if you see something like the below in a perf trace, then native is not working; you are using the java CRC functions rather than native:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"  5.02%  perf-53601.map      [.] Lorg/apache/hadoop/util/PureJavaCrc32C;.update"})})})})}),`
`,e.jsxs(i.p,{children:["See ",e.jsx(i.a,{href:"https://issues.apache.org/jira/browse/HBASE-11927",children:"HBASE-11927 Use Native Hadoop Library for HFile checksum (And flip default from CRC32 to CRC32C)"}),`,
for more on native checksumming support. See in particular the release note for how to check if your hardware to see if your processor has support for hardware CRCs.
Or checkout the Apache `,e.jsx(i.a,{href:"https://blogs.apache.org/hbase/entry/saving_cpu_using_native_hadoop",children:"Checksums in HBase"})," blog post."]}),`
`,e.jsxs(i.p,{children:["Here is example of how to point at the Hadoop libs with ",e.jsx(i.code,{children:"LD_LIBRARY_PATH"})," environment variable:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" LD_LIBRARY_PATH=~/hadoop-2.5.0-SNAPSHOT/lib/native"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ./bin/hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --config"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ~/conf_hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" org.apache.hadoop.util.NativeLibraryChecker"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"2014-08-26"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 13:42:49,332"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" INFO"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  [main] bzip2.Bzip2Factory: Successfully loaded & "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"initialized"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" native-bzip2"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" library"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" system-native"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"2014-08-26"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 13:42:49,337"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" INFO"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  [main] zlib.ZlibFactory: Successfully loaded & "}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"initialized"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" native-zlib"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" library"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Native"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" library"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" checking:"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hadoop:"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" true"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" /home/stack/hadoop-2.5.0-SNAPSHOT/lib/native/libhadoop.so.1.0.0"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"zlib:"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"   true"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" /lib64/libz.so.1"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"snappy:"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" true"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" /usr/lib64/libsnappy.so.1"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"lz4:"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"    true"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" revision:99"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"bzip2:"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"  true"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" /lib64/libbz2.so.1"})]})]})})}),`
`,e.jsxs(i.p,{children:["Set in ",e.jsx(i.em,{children:"hbase-env.sh"})," the LD_LIBRARY_PATH environment variable when starting your HBase."]}),`
`,e.jsx(i.h2,{id:"compressor-configuration-installation-and-use",children:"Compressor Configuration, Installation, and Use"}),`
`,e.jsx(i.h3,{id:"configure-hbase-for-compressors",children:"Configure HBase For Compressors"}),`
`,e.jsxs(i.p,{children:[`Compression codecs are provided either by HBase compressor modules or by Hadoop's native compression
support. As described above you choose a compression type in table or column family schema or in
site configuration using its short label, e.g. `,e.jsx(i.em,{children:"snappy"})," for Snappy, or ",e.jsx(i.em,{children:"zstd"}),` for ZStandard. Which
codec implementation is dynamically loaded to support what label is configurable by way of site
configuration.`]}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Algorithm label"}),e.jsx(i.th,{children:"Codec implementation configuration key"}),e.jsx(i.th,{children:"Default value"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"BROTLI"}),e.jsx(i.td,{children:"hbase.io.compress.brotli.codec"}),e.jsx(i.td,{children:"org.apache.hadoop.hbase.io.compress.brotli.BrotliCodec"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"BZIP2"}),e.jsx(i.td,{children:"hbase.io.compress.bzip2.codec"}),e.jsx(i.td,{children:"org.apache.hadoop.io.compress.BZip2Codec"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"GZ"}),e.jsx(i.td,{children:"hbase.io.compress.gz.codec"}),e.jsx(i.td,{children:"org.apache.hadoop.hbase.io.compress.ReusableStreamGzipCodec"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"LZ4"}),e.jsx(i.td,{children:"hbase.io.compress.lz4.codec"}),e.jsx(i.td,{children:"org.apache.hadoop.io.compress.Lz4Codec"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"LZMA"}),e.jsx(i.td,{children:"hbase.io.compress.lzma.codec"}),e.jsx(i.td,{children:"org.apache.hadoop.hbase.io.compress.xz.LzmaCodec"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"LZO"}),e.jsx(i.td,{children:"hbase.io.compress.lzo.codec"}),e.jsx(i.td,{children:"com.hadoop.compression.lzo.LzoCodec"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"SNAPPY"}),e.jsx(i.td,{children:"hbase.io.compress.snappy.codec"}),e.jsx(i.td,{children:"org.apache.hadoop.io.compress.SnappyCodec"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"ZSTD"}),e.jsx(i.td,{children:"hbase.io.compress.zstd.codec"}),e.jsx(i.td,{children:"org.apache.hadoop.io.compress.ZStandardCodec"})]})]})]}),`
`,e.jsx(i.p,{children:"The available codec implementation options are:"}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Label"}),e.jsx(i.th,{children:"Codec implementation class"}),e.jsx(i.th,{children:"Notes"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"BROTLI"}),e.jsx(i.td,{children:"org.apache.hadoop.hbase.io.compress.brotli.BrotliCodec"}),e.jsxs(i.td,{children:["Implemented with ",e.jsx(i.a,{href:"https://github.com/hyperxpro/Brotli4j",children:"Brotli4j"})]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"BZIP2"}),e.jsx(i.td,{children:"org.apache.hadoop.io.compress.BZip2Codec"}),e.jsx(i.td,{children:"Hadoop native codec"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"GZ"}),e.jsx(i.td,{children:"org.apache.hadoop.hbase.io.compress.ReusableStreamGzipCodec"}),e.jsx(i.td,{children:"Requires the Hadoop native GZ codec"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"LZ4"}),e.jsx(i.td,{children:"org.apache.hadoop.io.compress.Lz4Codec"}),e.jsx(i.td,{children:"Hadoop native codec"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"LZ4"}),e.jsx(i.td,{children:"org.apache.hadoop.hbase.io.compress.aircompressor.Lz4Codec"}),e.jsx(i.td,{children:"Pure Java implementation"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"LZ4"}),e.jsx(i.td,{children:"org.apache.hadoop.hbase.io.compress.lz4.Lz4Codec"}),e.jsxs(i.td,{children:["Implemented with ",e.jsx(i.a,{href:"https://github.com/lz4/lz4-java",children:"lz4-java"})]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"LZMA"}),e.jsx(i.td,{children:"org.apache.hadoop.hbase.io.compress.xz.LzmaCodec"}),e.jsxs(i.td,{children:["Implemented with ",e.jsx(i.a,{href:"https://tukaani.org/xz/java.html",children:"XZ For Java"})]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"LZO"}),e.jsx(i.td,{children:"com.hadoop.compression.lzo.LzoCodec"}),e.jsx(i.td,{children:"Hadoop native codec, requires GPL licensed native dependencies"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"LZO"}),e.jsx(i.td,{children:"org.apache.hadoop.io.compress.LzoCodec"}),e.jsx(i.td,{children:"Hadoop native codec, requires GPL licensed native dependencies"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"LZO"}),e.jsx(i.td,{children:"org.apache.hadoop.hbase.io.compress.aircompressor.LzoCodec"}),e.jsx(i.td,{children:"Pure Java implementation"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"SNAPPY"}),e.jsx(i.td,{children:"org.apache.hadoop.io.compress.SnappyCodec"}),e.jsx(i.td,{children:"Hadoop native codec"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"SNAPPY"}),e.jsx(i.td,{children:"org.apache.hadoop.hbase.io.compress.aircompressor.SnappyCodec"}),e.jsx(i.td,{children:"Pure Java implementation"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"SNAPPY"}),e.jsx(i.td,{children:"org.apache.hadoop.hbase.io.compress.xerial.SnappyCodec"}),e.jsxs(i.td,{children:["Implemented with ",e.jsx(i.a,{href:"https://github.com/xerial/snappy-java",children:"snappy-java"})]})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"ZSTD"}),e.jsx(i.td,{children:"org.apache.hadoop.io.compress.ZStandardCodec"}),e.jsx(i.td,{children:"Hadoop native codec"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"ZSTD"}),e.jsx(i.td,{children:"org.apache.hadoop.hbase.io.compress.aircompressor.ZstdCodec"}),e.jsx(i.td,{children:"Pure Java implementation, limited to a fixed compression level, not data compatible with the Hadoop zstd codec"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"ZSTD"}),e.jsx(i.td,{children:"org.apache.hadoop.hbase.io.compress.zstd.ZstdCodec"}),e.jsxs(i.td,{children:["Implemented with ",e.jsx(i.a,{href:"https://github.com/luben/zstd-jni",children:"zstd-jni"}),", supports all compression levels, supports custom dictionaries"]})]})]})]}),`
`,e.jsx(i.p,{children:`Specify which codec implementation option you prefer for a given compression algorithm
in site configuration, like so:`}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"..."})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">hbase.io.compress.lz4.codec</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">org.apache.hadoop.hbase.io.compress.lz4.Lz4Codec</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(i.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"..."})})]})})}),`
`,e.jsx(i.h4,{id:"compressor-microbenchmarks",children:"Compressor Microbenchmarks"}),`
`,e.jsxs(i.p,{children:["See ",e.jsx(i.a,{href:"https://github.com/apurtell/jmh-compression-tests",children:"https://github.com/apurtell/jmh-compression-tests"})]}),`
`,e.jsx(i.p,{children:`256MB (258,126,022 bytes exactly) of block data was extracted from two HFiles containing Common
Crawl data ingested using IntegrationLoadTestCommonCrawl, 2,680 blocks in total. This data was
processed by each new codec implementation as if the block data were being compressed again for
write into an HFile, but without writing any data, comparing only the CPU time and resource demand
of the codec itself. Absolute performance numbers will vary depending on hardware and software
particulars of your deployment. The relative differences are what are interesting. Measured time
is the average time in milliseconds required to compress all blocks of the 256MB file. This is
how long it would take to write the HFile containing these contents, minus the I/O overhead of
block encoding and actual persistence.`}),`
`,e.jsx(i.p,{children:"These are the results:"}),`
`,e.jsxs(i.table,{children:[e.jsx(i.thead,{children:e.jsxs(i.tr,{children:[e.jsx(i.th,{children:"Codec"}),e.jsx(i.th,{children:"Level"}),e.jsx(i.th,{children:"Time (milliseconds)"}),e.jsx(i.th,{children:"Result (bytes)"}),e.jsx(i.th,{children:"Improvement"})]})}),e.jsxs(i.tbody,{children:[e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"AirCompressor LZ4"}),e.jsx(i.td,{children:"-"}),e.jsx(i.td,{children:"349.989 ± 2.835"}),e.jsx(i.td,{children:"76,999,408"}),e.jsx(i.td,{children:"70.17%"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"AirCompressor LZO"}),e.jsx(i.td,{children:"-"}),e.jsx(i.td,{children:"334.554 ± 3.243"}),e.jsx(i.td,{children:"79,369,805"}),e.jsx(i.td,{children:"69.25%"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"AirCompressor Snappy"}),e.jsx(i.td,{children:"-"}),e.jsx(i.td,{children:"364.153 ± 19.718"}),e.jsx(i.td,{children:"80,201,763"}),e.jsx(i.td,{children:"68.93%"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"AirCompressor Zstandard"}),e.jsx(i.td,{children:"3 (effective)"}),e.jsx(i.td,{children:"1108.267 ± 8.969"}),e.jsx(i.td,{children:"55,129,189"}),e.jsx(i.td,{children:"78.64%"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Brotli"}),e.jsx(i.td,{children:"1"}),e.jsx(i.td,{children:"593.107 ± 2.376"}),e.jsx(i.td,{children:"58,672,319"}),e.jsx(i.td,{children:"77.27%"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Brotli"}),e.jsx(i.td,{children:"3"}),e.jsx(i.td,{children:"1345.195 ± 27.327"}),e.jsx(i.td,{children:"53,917,438"}),e.jsx(i.td,{children:"79.11%"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Brotli"}),e.jsx(i.td,{children:"6"}),e.jsx(i.td,{children:"2812.411 ± 25.372"}),e.jsx(i.td,{children:"48,696,441"}),e.jsx(i.td,{children:"81.13%"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Brotli"}),e.jsx(i.td,{children:"10"}),e.jsx(i.td,{children:"74615.936 ± 224.854"}),e.jsx(i.td,{children:"44,970,710"}),e.jsx(i.td,{children:"82.58%"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"LZ4 (lz4-java)"}),e.jsx(i.td,{children:"-"}),e.jsx(i.td,{children:"303.045 ± 0.783"}),e.jsx(i.td,{children:"76,974,364"}),e.jsx(i.td,{children:"70.18%"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"LZMA"}),e.jsx(i.td,{children:"1"}),e.jsx(i.td,{children:"6410.428 ± 115.065"}),e.jsx(i.td,{children:"49,948,535"}),e.jsx(i.td,{children:"80.65%"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"LZMA"}),e.jsx(i.td,{children:"3"}),e.jsx(i.td,{children:"8144.620 ± 152.119"}),e.jsx(i.td,{children:"49,109,363"}),e.jsx(i.td,{children:"80.97%"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"LZMA"}),e.jsx(i.td,{children:"6"}),e.jsx(i.td,{children:"43802.576 ± 382.025"}),e.jsx(i.td,{children:"46,951,810"}),e.jsx(i.td,{children:"81.81%"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"LZMA"}),e.jsx(i.td,{children:"9"}),e.jsx(i.td,{children:"49821.979 ± 580.110"}),e.jsx(i.td,{children:"46,951,810"}),e.jsx(i.td,{children:"81.81%"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Snappy (xerial)"}),e.jsx(i.td,{children:"-"}),e.jsx(i.td,{children:"360.225 ± 2.324"}),e.jsx(i.td,{children:"80,749,937"}),e.jsx(i.td,{children:"68.72%"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Zstd (zstd-jni)"}),e.jsx(i.td,{children:"1"}),e.jsx(i.td,{children:"654.699 ± 16.839"}),e.jsx(i.td,{children:"56,719,994"}),e.jsx(i.td,{children:"78.03%"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Zstd (zstd-jni)"}),e.jsx(i.td,{children:"3"}),e.jsx(i.td,{children:"839.160 ± 24.906"}),e.jsx(i.td,{children:"54,573,095"}),e.jsx(i.td,{children:"78.86%"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Zstd (zstd-jni)"}),e.jsx(i.td,{children:"5"}),e.jsx(i.td,{children:"1594.373 ± 22.384"}),e.jsx(i.td,{children:"52,025,485"}),e.jsx(i.td,{children:"79.84%"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Zstd (zstd-jni)"}),e.jsx(i.td,{children:"7"}),e.jsx(i.td,{children:"2308.705 ± 24.744"}),e.jsx(i.td,{children:"50,651,554"}),e.jsx(i.td,{children:"80.38%"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Zstd (zstd-jni)"}),e.jsx(i.td,{children:"9"}),e.jsx(i.td,{children:"3659.677 ± 58.018"}),e.jsx(i.td,{children:"50,208,425"}),e.jsx(i.td,{children:"80.55%"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Zstd (zstd-jni)"}),e.jsx(i.td,{children:"12"}),e.jsx(i.td,{children:"8705.294 ± 58.080"}),e.jsx(i.td,{children:"49,841,446"}),e.jsx(i.td,{children:"80.69%"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Zstd (zstd-jni)"}),e.jsx(i.td,{children:"15"}),e.jsx(i.td,{children:"19785.646 ± 278.080"}),e.jsx(i.td,{children:"48,499,508"}),e.jsx(i.td,{children:"81.21%"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Zstd (zstd-jni)"}),e.jsx(i.td,{children:"18"}),e.jsx(i.td,{children:"47702.097 ± 442.670"}),e.jsx(i.td,{children:"48,319,879"}),e.jsx(i.td,{children:"81.28%"})]}),e.jsxs(i.tr,{children:[e.jsx(i.td,{children:"Zstd (zstd-jni)"}),e.jsx(i.td,{children:"22"}),e.jsx(i.td,{children:"97799.695 ± 1106.571"}),e.jsx(i.td,{children:"48,212,220"}),e.jsx(i.td,{children:"81.32%"})]})]})]}),`
`,e.jsx(i.h4,{id:"compressor-support-on-the-master",children:"Compressor Support On the Master"}),`
`,e.jsxs(i.p,{children:[`A new configuration setting was introduced in HBase 0.95, to check the Master to determine which data block encoders are installed and configured on it, and assume that the entire cluster is configured the same.
This option, `,e.jsx(i.code,{children:"hbase.master.check.compression"}),", defaults to ",e.jsx(i.code,{children:"true"}),`.
This prevents the situation described in `,e.jsx(i.a,{href:"https://issues.apache.org/jira/browse/HBASE-6370",children:"HBASE-6370"}),", where a table is created or modified to support a codec that a region server does not support, leading to failures that take a long time to occur and are difficult to debug."]}),`
`,e.jsxs(i.p,{children:["If ",e.jsx(i.code,{children:"hbase.master.check.compression"})," is enabled, libraries for all desired compressors need to be installed and configured on the Master, even if the Master does not run a region server."]}),`
`,e.jsx(i.h4,{id:"install-gz-support-via-native-libraries",children:"Install GZ Support Via Native Libraries"}),`
`,e.jsxs(i.p,{children:[`HBase uses Java's built-in GZip support unless the native Hadoop libraries are available on the CLASSPATH.
The recommended way to add libraries to the CLASSPATH is to set the environment variable `,e.jsx(i.code,{children:"HBASE_LIBRARY_PATH"}),` for the user running HBase.
If native libraries are not available and Java's GZIP is used, `,e.jsx(i.code,{children:"Got brand-new compressor"}),` reports will be present in the logs.
See `,e.jsx(i.a,{href:"/docs/troubleshooting#logs-flooded-with-2011-01-10-124048407-info-orgapachehadoopiocompresscodecpool-gotbrand-new-compressor-messages",children:"brand.new.compressor"}),")."]}),`
`,e.jsx(i.h4,{id:"install-hadoop-native-lzo-support",children:"Install Hadoop Native LZO Support"}),`
`,e.jsxs(i.p,{children:[`HBase cannot ship with the Hadoop native LZO codc because of incompatibility between HBase, which uses an Apache Software License (ASL) and LZO, which uses a GPL license.
See the `,e.jsx(i.a,{href:"https://github.com/twitter/hadoop-lzo/blob/master/README.md",children:"Hadoop-LZO at Twitter"})," for information on configuring LZO support for HBase."]}),`
`,e.jsxs(i.p,{children:[`If you depend upon LZO compression, consider using the pure Java and ASL licensed
AirCompressor LZO codec option instead of the Hadoop native default, or configure your
RegionServers to fail to start if native LZO support is not available.
See `,e.jsx(i.a,{href:"/docs/compression#enforce-compression-settings-on-a-regionserver",children:"hbase.regionserver.codecs"}),"."]}),`
`,e.jsx(i.h4,{id:"configure-hadoop-native-lz4-support",children:"Configure Hadoop Native LZ4 Support"}),`
`,e.jsx(i.p,{children:`LZ4 support is bundled with Hadoop and is the default LZ4 codec implementation.
It is not required that you make use of the Hadoop LZ4 codec. Our LZ4 codec implemented
with lz4-java offers superior performance, and the AirCompressor LZ4 codec offers a
pure Java option for use where native support is not available.`}),`
`,e.jsxs(i.p,{children:[`That said, if you prefer the Hadoop option, make sure the hadoop shared library
(libhadoop.so) is accessible when you start HBase.
After configuring your platform (see `,e.jsx(i.a,{href:"/docs/compression#making-use-of-hadoop-native-libraries-in-hbase",children:"hadoop.native.lib"}),`), you can
make a symbolic link from HBase to the native Hadoop libraries. This assumes the two
software installs are colocated. For example, if my 'platform' is Linux-amd64-64:`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" cd"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" $HBASE_HOME"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" mkdir"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" lib/native"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ln"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -s"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" $HADOOP_HOME"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"/lib/native"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" lib/native/Linux-amd64-64"})]})]})})}),`
`,e.jsx(i.p,{children:`Use the compression tool to check that LZ4 is installed on all nodes.
Start up (or restart) HBase.
Afterward, you can create and alter tables to enable LZ4 as a compression codec.:`}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M20.156.083c3.033.525 3.893 2.598 3.829 4.77L24 4.822 22.635 22.71 4.89 23.926h.016C3.433 23.864.15 23.729 0 19.139l1.645-3 2.819 6.586.503 1.172 2.805-9.144-.03.007.016-.03 9.255 2.956-1.396-5.431-.99-3.9 8.82-.569-.615-.51L16.5 2.114 20.159.073l-.003.01zM0 19.089zM5.13 5.073c3.561-3.533 8.157-5.621 9.922-3.84 1.762 1.777-.105 6.105-3.673 9.636-3.563 3.532-8.103 5.734-9.864 3.957-1.766-1.777.045-6.217 3.612-9.75l.003-.003z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(main):"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"003"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:":"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" alter "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'TestTable'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", {"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"NAME"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'info'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"COMPRESSION"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'LZ4'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})]})})})}),`
`,e.jsx(i.h4,{id:"install-hadoop-native-snappy-support",children:"Install Hadoop native Snappy Support"}),`
`,e.jsx(i.p,{children:`Snappy support is bundled with Hadoop and is the default Snappy codec implementation.
It is not required that you make use of the Hadoop Snappy codec. Our Snappy codec
implemented with Xerial Snappy offers superior performance, and the AirCompressor
Snappy codec offers a pure Java option for use where native support is not available.`}),`
`,e.jsxs(i.p,{children:[`That said, if you prefer the Hadoop codec option, you can install Snappy binaries (for
instance, by using +yum install snappy+ on CentOS) or build Snappy from source.
After installing Snappy, search for the shared library, which will be called `,e.jsx(i.em,{children:"libsnappy.so.X"}),` where X is a number.
If you built from source, copy the shared library to a known location on your system, such as `,e.jsx(i.em,{children:"/opt/snappy/lib/"}),"."]}),`
`,e.jsxs(i.p,{children:["In addition to the Snappy library, HBase also needs access to the Hadoop shared library, which will be called something like ",e.jsx(i.em,{children:"libhadoop.so.X.Y"}),`, where X and Y are both numbers.
Make note of the location of the Hadoop library, or copy it to the same location as the Snappy library.`]}),`
`,e.jsxs(n,{type:"info",children:[e.jsxs(i.p,{children:[`The Snappy and Hadoop libraries need to be available on each node of your cluster.
See `,e.jsx(i.a,{href:"/docs/compression#compressiontest",children:"compression.test"})," to find out how to test that this is the case."]}),e.jsxs(i.p,{children:["See ",e.jsx(i.a,{href:"/docs/compression#enforce-compression-settings-on-a-regionserver",children:"hbase.regionserver.codecs"})," to configure your RegionServers to fail to start if a given compressor is not available."]})]}),`
`,e.jsxs(i.p,{children:["Each of these library locations need to be added to the environment variable ",e.jsx(i.code,{children:"HBASE_LIBRARY_PATH"}),` for the operating system user that runs HBase.
You need to restart the RegionServer for the changes to take effect.`]}),`
`,e.jsx(i.h4,{id:"compressiontest",children:"CompressionTest"}),`
`,e.jsx(i.p,{children:"You can use the CompressionTest tool to verify that your compressor is available to HBase:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" $"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" org.apache.hadoop.hbase.util.CompressionTest"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" hdfs://host/path/to/hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" snappy"})]})})})}),`
`,e.jsx(i.h4,{id:"enforce-compression-settings-on-a-regionserver",children:"Enforce Compression Settings On a RegionServer"}),`
`,e.jsxs(i.p,{children:["You can configure a RegionServer so that it will fail to restart if compression is configured incorrectly, by adding the option hbase.regionserver.codecs to the ",e.jsx(i.em,{children:"hbase-site.xml"}),`, and setting its value to a comma-separated list of codecs that need to be available.
For example, if you set this property to `,e.jsx(i.code,{children:"lzo,gz"}),`, the RegionServer would fail to start if both compressors were not available.
This would prevent a new server from being added to the cluster without having codecs configured properly.`]}),`
`,e.jsx(i.h3,{id:"enable-compression-on-a-columnfamily",children:"Enable Compression On a ColumnFamily"}),`
`,e.jsxs(i.p,{children:["To enable compression for a ColumnFamily, use an ",e.jsx(i.code,{children:"alter"}),` command.
You do not need to re-create the table or copy data.
If you are changing codecs, be sure the old codec is still available until all the old StoreFiles have been compacted.`]}),`
`,e.jsx(i.h4,{id:"enabling-compression-on-a-columnfamily-of-an-existing-table-using-hbaseshell",children:"Enabling Compression on a ColumnFamily of an Existing Table using HBaseShell"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M20.156.083c3.033.525 3.893 2.598 3.829 4.77L24 4.822 22.635 22.71 4.89 23.926h.016C3.433 23.864.15 23.729 0 19.139l1.645-3 2.819 6.586.503 1.172 2.805-9.144-.03.007.016-.03 9.255 2.956-1.396-5.431-.99-3.9 8.82-.569-.615-.51L16.5 2.114 20.159.073l-.003.01zM0 19.089zM5.13 5.073c3.561-3.533 8.157-5.621 9.922-3.84 1.762 1.777-.105 6.105-3.673 9.636-3.563 3.532-8.103 5.734-9.864 3.957-1.766-1.777.045-6.217 3.612-9.75l.003-.003z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" alter "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'test'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", {"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"NAME"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'cf'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"COMPRESSION"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'GZ'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})]})})})}),`
`,e.jsx(i.h4,{id:"creating-a-new-table-with-compression-on-a-columnfamily",children:"Creating a New Table with Compression On a ColumnFamily"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M20.156.083c3.033.525 3.893 2.598 3.829 4.77L24 4.822 22.635 22.71 4.89 23.926h.016C3.433 23.864.15 23.729 0 19.139l1.645-3 2.819 6.586.503 1.172 2.805-9.144-.03.007.016-.03 9.255 2.956-1.396-5.431-.99-3.9 8.82-.569-.615-.51L16.5 2.114 20.159.073l-.003.01zM0 19.089zM5.13 5.073c3.561-3.533 8.157-5.621 9.922-3.84 1.762 1.777-.105 6.105-3.673 9.636-3.563 3.532-8.103 5.734-9.864 3.957-1.766-1.777.045-6.217 3.612-9.75l.003-.003z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" create "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'test2'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", { "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"NAME"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'cf2'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"COMPRESSION"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'SNAPPY'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" }"})]})})})}),`
`,e.jsx(i.h4,{id:"verifying-a-columnfamilys-compression-settings",children:"Verifying a ColumnFamily's Compression Settings"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M20.156.083c3.033.525 3.893 2.598 3.829 4.77L24 4.822 22.635 22.71 4.89 23.926h.016C3.433 23.864.15 23.729 0 19.139l1.645-3 2.819 6.586.503 1.172 2.805-9.144-.03.007.016-.03 9.255 2.956-1.396-5.431-.99-3.9 8.82-.569-.615-.51L16.5 2.114 20.159.073l-.003.01zM0 19.089zM5.13 5.073c3.561-3.533 8.157-5.621 9.922-3.84 1.762 1.777-.105 6.105-3.673 9.636-3.563 3.532-8.103 5.734-9.864 3.957-1.766-1.777.045-6.217 3.612-9.75l.003-.003z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" describe "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'test'"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"DESCRIPTION"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"                                          ENABLED"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'test'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", {"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"NAME"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'cf'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"DATA_BLOCK_ENCODING"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'NONE false"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" '"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"BLOOMFILTER"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'ROW'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"REPLICATION_SCOPE"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'0'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" VERSIONS"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'1'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"COMPRESSION"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'GZ'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"MIN_VERSIONS"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'0'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"TTL"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'FOREVER'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"KEEP_DELETED_CELLS"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'fa"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" lse'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"BLOCKSIZE"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'65536'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"IN_MEMORY"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'false'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"B"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" LOCKCACHE"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'true'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" row"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(s) "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"in"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0.1070"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" seconds"})]})]})})}),`
`,e.jsx(i.h3,{id:"testing-compression-performance",children:"Testing Compression Performance"}),`
`,e.jsxs(i.p,{children:[`HBase includes a tool called LoadTestTool which provides mechanisms to test your compression performance.
You must specify either `,e.jsx(i.code,{children:"-write"})," or ",e.jsx(i.code,{children:"-update-read"})," as your first parameter, and if you do not specify another parameter, usage advice is printed for each option."]}),`
`,e.jsx(i.p,{children:e.jsxs(i.strong,{children:[e.jsx(i.code,{children:"LoadTestTool"})," Usage"]})}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" bin/hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" org.apache.hadoop.hbase.util.LoadTestTool"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -h"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"usage:"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" bin/hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" org.apache.hadoop.hbase.util.LoadTestTool"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"option"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"s"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"Options:"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" -batchupdate"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"                 Whether"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" to"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" use"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" batch"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" as"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" opposed"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" to"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" separate"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"                              updates"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" for"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" every"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" column"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" in"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" a"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" row"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" -bloom"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"ar"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"g"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"                 Bloom"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" filter"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" type,"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" one"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" of"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" [NONE, "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"ROW,"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ROWCOL]"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" -compression"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"ar"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"g"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"           Compression"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" type,"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" one"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" of"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" [LZO, "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"GZ,"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" NONE,"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" SNAPPY,"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"                              LZ4]"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" -data_block_encoding"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"ar"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"g"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"   Encoding"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" algorithm"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (e.g. "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"prefix"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" compression"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") to"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"                              use"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" for"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" data"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" blocks"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" in"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" the"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" test"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" column"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" family,"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" one"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"                              of"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" [NONE, "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"PREFIX,"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" DIFF,"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" FAST_DIFF,"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" ROW_INDEX_V1]."})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" -encryption"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"ar"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"g"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"            Enables"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" transparent"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" encryption"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" on"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" the"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" test"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" table,"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"                              one"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" of"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" [AES]"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" -generator"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"ar"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"g"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"             The"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" class"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" which"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" generates"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" load"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" for"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" the"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" tool."}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Any"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"                              args"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" for"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" this"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" class"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" can"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" be"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" passed"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" as"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" colon"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"                              separated"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" after"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" class"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" name"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" -h,--help"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"                    Show"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" usage"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" -in_memory"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"                   Tries"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" to"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" keep"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" the"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" HFiles"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" of"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" the"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" CF"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" inmemory"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" as"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" far"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"                              as"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" possible."}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"  Not"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" guaranteed"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" that"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" reads"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" are"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" always"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"                              served"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" from"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" inmemory"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" -init_only"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"                   Initialize"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" the"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" test"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" table"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" only,"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" don't do any"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"                              loading"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" -key_window <arg>            The 'key"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" window' to maintain between reads and"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"                              writes for concurrent write/read workload. The"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"                              default is 0."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" -max_read_errors <arg>       The maximum number of read errors to tolerate"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"                              before terminating all reader threads. The default"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"                              is 10."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" -multiput                    Whether to use multi-puts as opposed to separate"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"                              puts for every column in a row"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" -num_keys <arg>              The number of keys to read/write"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" -num_tables <arg>            A positive integer number. When a number n is"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"                              speicfied, load test tool  will load n table"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"                              parallely. -tn parameter value becomes table name"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"                              prefix. Each table name is in format"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"                              <tn>_1...<tn>_n"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" -read <arg>                  <verify_percent>[:#threads=20]"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" -regions_per_server <arg>    A positive integer number. When a number n is"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"                              specified, load test tool will create the test"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"                              table with n regions per server"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" -skip_init                   Skip the initialization; assume test table already"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"                              exists"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" -start_key <arg>             The first key to read/write (a 0-based index). The"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"                              default value is 0."})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" -tn <arg>                    The name of the table to read or write"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" -update <arg>                <update_percent>[:#threads=20][:#whether to"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"                              ignore nonce collisions=0]"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" -write <arg>                 <avg_cols_per_key>:<avg_data_size>[:#threads=20]"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" -zk <arg>                    ZK quorum as comma-separated host names without"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"                              port numbers"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" -zk_root <arg>               name of parent znode in zookeeper"})})]})})}),`
`,e.jsx(i.h4,{id:"example-usage-of-loadtesttool",children:"Example Usage of LoadTestTool"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" org.apache.hadoop.hbase.util.LoadTestTool"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -write"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 1:10:100"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -num_keys"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 1000000"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" \\"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"      -read"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 100:30"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -num_tables"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 1"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -data_block_encoding"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" NONE"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -tn"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" load_test_tool_NONE"})]})]})})}),`
`,e.jsx(i.h2,{id:"enable-data-block-encoding",children:"Enable Data Block Encoding"}),`
`,e.jsxs(i.p,{children:[`Codecs are built into HBase so no extra configuration is needed.
Codecs are enabled on a table by setting the `,e.jsx(i.code,{children:"DATA_BLOCK_ENCODING"}),` property.
Disable the table before altering its DATA_BLOCK_ENCODING setting.
Following is an example using HBase Shell:`]}),`
`,e.jsx(i.h4,{id:"enable-data-block-encoding-on-a-table",children:"Enable Data Block Encoding On a Table"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M20.156.083c3.033.525 3.893 2.598 3.829 4.77L24 4.822 22.635 22.71 4.89 23.926h.016C3.433 23.864.15 23.729 0 19.139l1.645-3 2.819 6.586.503 1.172 2.805-9.144-.03.007.016-.03 9.255 2.956-1.396-5.431-.99-3.9 8.82-.569-.615-.51L16.5 2.114 20.159.073l-.003.01zM0 19.089zM5.13 5.073c3.561-3.533 8.157-5.621 9.922-3.84 1.762 1.777-.105 6.105-3.673 9.636-3.563 3.532-8.103 5.734-9.864 3.957-1.766-1.777.045-6.217 3.612-9.75l.003-.003z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" alter "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'test'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", { "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"NAME"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'cf'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"DATA_BLOCK_ENCODING"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'FAST_DIFF'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" }"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Updating"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" all regions with the "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"new"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" schema..."})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" regions updated."})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"/"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" regions updated."})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Done"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"0"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" row"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(s) "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"in"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 2.2820"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" seconds"})]})]})})}),`
`,e.jsx(i.h4,{id:"verifying-a-columnfamilys-data-block-encoding",children:"Verifying a ColumnFamily's Data Block Encoding"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M20.156.083c3.033.525 3.893 2.598 3.829 4.77L24 4.822 22.635 22.71 4.89 23.926h.016C3.433 23.864.15 23.729 0 19.139l1.645-3 2.819 6.586.503 1.172 2.805-9.144-.03.007.016-.03 9.255 2.956-1.396-5.431-.99-3.9 8.82-.569-.615-.51L16.5 2.114 20.159.073l-.003.01zM0 19.089zM5.13 5.073c3.561-3.533 8.157-5.621 9.922-3.84 1.762 1.777-.105 6.105-3.673 9.636-3.563 3.532-8.103 5.734-9.864 3.957-1.766-1.777.045-6.217 3.612-9.75l.003-.003z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" describe "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'test'"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"DESCRIPTION"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"                                          ENABLED"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'test'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", {"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"NAME"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'cf'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"DATA_BLOCK_ENCODING"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'FAST true"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" _DIFF'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"BLOOMFILTER"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'ROW'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"REPLICATION_SCOPE"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" =>"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" '0'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"VERSIONS"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'1'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"COMPRESSION"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'GZ'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"MIN_VERS"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" IONS"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'0'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"TTL"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'FOREVER'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"KEEP_DELETED_CELLS"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" ="})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" >"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" 'false'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"BLOCKSIZE"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'65536'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"IN_MEMORY"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'fals"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" e'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"BLOCKCACHE"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'true'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" row"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(s) "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"in"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 0.0650"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" seconds"})]})]})})})]})}function f(s={}){const{wrapper:i}=s.components||{};return i?e.jsx(i,{...s,children:e.jsx(a,{...s})}):a(s)}function h(s,i){throw new Error("Expected component `"+s+"` to be defined: you likely forgot to import, pass, or provide it.")}export{d as _markdown,f as default,m as extractedReferences,p as frontmatter,k as structuredData,g as toc};
