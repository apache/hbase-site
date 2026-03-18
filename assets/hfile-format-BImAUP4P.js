import{j as e}from"./chunk-EPOLDU6W-B5LwAila.js";import{_ as o,a as s}from"./hfilev2-L4pQhBIf.js";let l=`



## HBase File Format (version 1)

As we will be discussing changes to the HFile format, it is useful to give a short overview of the original (HFile version 1) format.

### Overview of Version 1

An HFile in version 1 format is structured as follows:

<img alt="HFile V1 Format" src={__img0} placeholder="blur" />

### Block index format in version 1

The block index in version 1 is very straightforward.
For each entry, it contains:

1. Offset (long)
2. Uncompressed size (int)
3. Key (a serialized byte array written using Bytes.writeByteArray)
   * Key length as a variable-length integer (VInt)
   * Key bytes

The number of entries in the block index is stored in the fixed file trailer, and has to be passed in to the method that reads the block index.
One of the limitations of the block index in version 1 is that it does not provide the compressed size of a block, which turns out to be necessary for decompression.
Therefore, the HFile reader has to infer this compressed size from the offset difference between blocks.
We fix this limitation in version 2, where we store on-disk block size instead of uncompressed size, and get uncompressed size from the block header.

## HBase file format with inline blocks (version 2)

Note: this feature was introduced in HBase 0.92

### Motivation

We found it necessary to revise the HFile format after encountering high memory usage and slow startup times caused by large Bloom filters and block indexes in the region server.
Bloom filters can get as large as 100 MB per HFile, which adds up to 2 GB when aggregated over 20 regions.
Block indexes can grow as large as 6 GB in aggregate size over the same set of regions.
A region is not considered opened until all of its block index data is loaded.
Large Bloom filters produce a different performance problem: the first get request that requires a Bloom filter lookup will incur the latency of loading the entire Bloom filter bit array.

To speed up region server startup we break Bloom filters and block indexes into multiple blocks and write those blocks out as they fill up, which also reduces the HFile writer's memory footprint.
In the Bloom filter case, "filling up a block" means accumulating enough keys to efficiently utilize a fixed-size bit array, and in the block index case we accumulate an "index block" of the desired size.
Bloom filter blocks and index blocks (we call these "inline blocks") become interspersed with data blocks, and as a side effect we can no longer rely on the difference between block offsets to determine data block length, as it was done in version 1.

HFile is a low-level file format by design, and it should not deal with application-specific details such as Bloom filters, which are handled at StoreFile level.
Therefore, we call Bloom filter blocks in an HFile "inline" blocks.
We also supply HFile with an interface to write those inline blocks.

Another format modification aimed at reducing the region server startup time is to use a contiguous "load-on-open" section that has to be loaded in memory at the time an HFile is being opened.
Currently, as an HFile opens, there are separate seek operations to read the trailer, data/meta indexes, and file info.
To read the Bloom filter, there are two more seek operations for its "data" and "meta" portions.
In version 2, we seek once to read the trailer and seek again to read everything else we need to open the file from a contiguous block.

### Overview of Version 2

The version of HBase introducing the above features reads both version 1 and 2 HFiles, but only writes version 2 HFiles.
A version 2 HFile is structured as follows:

<img alt="HFile Version 2 Structure" src={__img1} placeholder="blur" />

### Unified version 2 block format

In the version 2 every block in the data section contains the following fields:

1. 8 bytes: Block type, a sequence of bytes equivalent to version 1's "magic records". Supported block types are:
   * DATA – data blocks
   * LEAF\\_INDEX – leaf-level index blocks in a multi-level-block-index
   * BLOOM\\_CHUNK – Bloom filter chunks
   * META – meta blocks (not used for Bloom filters in version 2 anymore)
   * INTERMEDIATE\\_INDEX – intermediate-level index blocks in a multi-level blockindex
   * ROOT\\_INDEX – root-level index blocks in a multi-level block index
   * FILE\\_INFO – the "file info" block, a small key-value map of metadata
   * BLOOM\\_META – a Bloom filter metadata block in the load-on-open section
   * TRAILER – a fixed-size file trailer. As opposed to the above, this is not an HFile v2 block but a fixed-size (for each HFile version) data structure
   * INDEX\\_V1 – this block type is only used for legacy HFile v1 block
2. Compressed size of the block's data, not including the header (int).\\
   Can be used for skipping the current data block when scanning HFile data.
3. Uncompressed size of the block's data, not including the header (int)\\
   This is equal to the compressed size if the compression algorithm is NONE
4. File offset of the previous block of the same type (long)\\
   Can be used for seeking to the previous data/index block
5. Compressed data (or uncompressed data if the compression algorithm is NONE).

The above format of blocks is used in the following HFile sections:

#### Scanned block section

The section is named so because it contains all data blocks that need to be read when an HFile is scanned sequentially.
Also contains Leaf index blocks and Bloom chunk blocks.

#### Non-scanned block section

This section still contains unified-format v2 blocks but it does not have to be read when doing a sequential scan.
This section contains "meta" blocks and intermediate-level index blocks.

We are supporting "meta" blocks in version 2 the same way they were supported in version 1, even though we do not store Bloom filter data in these blocks anymore.

### Block index in version 2

There are three types of block indexes in HFile version 2, stored in two different formats (root and non-root):

1. Data index — version 2 multi-level block index, consisting of:
   * Version 2 root index, stored in the data block index section of the file
   * Optionally, version 2 intermediate levels, stored in the non-root format in the data index section of the file. Intermediate levels can only be present if leaf level blocks are present
   * Optionally, version 2 leaf levels, stored in the non-root format inline with data blocks
2. Meta index — version 2 root index format only, stored in the meta index section of the file
3. Bloom index — version 2 root index format only, stored in the "load-on-open" section as part of Bloom filter metadata.

### Root block index format in version 2

This format applies to:

1. Root level of the version 2 data index
2. Entire meta and Bloom indexes in version 2, which are always single-level.

A version 2 root index block is a sequence of entries of the following format, similar to entries of a version 1 block index, but storing on-disk size instead of uncompressed size.

1. Offset (long)\\
   This offset may point to a data block or to a deeper-level index block.
2. On-disk size (int)
3. Key (a serialized byte array stored using Bytes.writeByteArray)
4. Key (VInt)
5. Key bytes

A single-level version 2 block index consists of just a single root index block.
To read a root index block of version 2, one needs to know the number of entries.
For the data index and the meta index the number of entries is stored in the trailer, and for the Bloom index it is stored in the compound Bloom filter metadata.

For a multi-level block index we also store the following fields in the root index block in the load-on-open section of the HFile, in addition to the data structure described above:

* Middle leaf index block offset
* Middle leaf block on-disk size (meaning the leaf index block containing the reference to the "middle" data block of the file)
* The index of the mid-key (defined below) in the middle leaf-level block.

These additional fields are used to efficiently retrieve the mid-key of the HFile used in HFile splits, which we define as the first key of the block with a zero-based index of (n – 1) / 2, if the total number of blocks in the HFile is n.
This definition is consistent with how the mid-key was determined in HFile version 1, and is reasonable in general, because blocks are likely to be the same size on average, but we don't have any estimates on individual key/value pair sizes.

When writing a version 2 HFile, the total number of data blocks pointed to by every leaf-level index block is kept track of.
When we finish writing and the total number of leaf-level blocks is determined, it is clear which leaf-level block contains the mid-key, and the fields listed above are computed.
When reading the HFile and the mid-key is requested, we retrieve the middle leaf index block (potentially from the block cache) and get the mid-key value from the appropriate position inside that leaf block.

### Non-root block index format in version 2

This format applies to intermediate-level and leaf index blocks of a version 2 multi-level data block index.
Every non-root index block is structured as follows.

1. numEntries: the number of entries (int).
2. entryOffsets: the "secondary index" of offsets of entries in the block, to facilitate
   a quick binary search on the key (\`numEntries + 1\` int values). The last value
   is the total length of all entries in this index block. For example, in a non-root
   index block with entry sizes 60, 80, 50 the "secondary index" will contain the
   following int array: \`{0, 60, 140, 190}\`.
3. Entries. Each entry contains:
   * Offset of the block referenced by this entry in the file (long)
   * On-disk size of the referenced block (int)
   * Key. The length can be calculated from entryOffsets.

### Bloom filters in version 2

In contrast with version 1, in a version 2 HFile Bloom filter metadata is stored in the load-on-open section of the HFile for quick startup.

* A compound Bloom filter.
* Bloom filter version = 3 (int). There used to be a DynamicByteBloomFilter class that had the Bloom filter version number 2
* The total byte size of all compound Bloom filter chunks (long)
* Number of hash functions (int)
* Type of hash functions (int)
* The total key count inserted into the Bloom filter (long)
* The maximum total number of keys in the Bloom filter (long)
* The number of chunks (int)
* Comparator class used for Bloom filter keys, a UTF-8 encoded string stored using Bytes.writeByteArray
* Bloom block index in the version 2 root block index format

### File Info format in versions 1 and 2

The file info block is a serialized map from byte arrays to byte arrays, with the following keys, among others.
StoreFile-level logic adds more keys to this.

| Key                   | Description                                |
| --------------------- | ------------------------------------------ |
| hfile.LASTKEY         | The last key of the file (byte array)      |
| hfile.AVG\\_KEY\\_LEN   | The average key length in the file (int)   |
| hfile.AVG\\_VALUE\\_LEN | The average value length in the file (int) |

In version 2, we did not change the file format, but we moved the file info to
the final section of the file, which can be loaded as one block when the HFile
is being opened.

Also, we do not store the comparator in the version 2 file info anymore.
Instead, we store it in the fixed file trailer.
This is because we need to know the comparator at the time of parsing the load-on-open section of the HFile.

### Fixed file trailer format differences between versions 1 and 2

The following table shows common and different fields between fixed file trailers in versions 1 and 2.
Note that the size of the trailer is different depending on the version, so it is "fixed" only within one version.
However, the version is always stored as the last four-byte integer in the file.

#### Differences between HFile Versions 1 and 2

| Version 1                                                                                                       | Version 2                                                                                                                                                      |
| --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|                                                                                                                 | File info offset (long)                                                                                                                                        |
| Data index offset (long)                                                                                        | loadOnOpenOffset (long) *The offset of the section that we need to load when opening the file.*                                                                |
|                                                                                                                 | Number of data index entries (int)                                                                                                                             |
| metaIndexOffset (long) *This field is not being used by the version 1 reader, so we removed it from version 2.* | uncompressedDataIndexSize (long) *The total uncompressed size of the whole data block index, including root-level, intermediate-level, and leaf-level blocks.* |
|                                                                                                                 | Number of meta index entries (int)                                                                                                                             |
|                                                                                                                 | Total uncompressed bytes (long)                                                                                                                                |
| numEntries (int)                                                                                                | numEntries (long)                                                                                                                                              |
| Compression codec: 0 = LZO, 1 = GZ, 2 = NONE (int)                                                              | Compression codec: 0 = LZO, 1 = GZ, 2 = NONE (int)                                                                                                             |
|                                                                                                                 | The number of levels in the data block index (int)                                                                                                             |
|                                                                                                                 | firstDataBlockOffset (long) *The offset of the first data block. Used when scanning.*                                                                          |
|                                                                                                                 | lastDataBlockEnd (long) *The offset of the first byte after the last key/value data block. We don't need to go beyond this offset when scanning.*              |
| Version: 1 (int)                                                                                                | Version: 2 (int)                                                                                                                                               |

### getShortMidpointKey (an optimization for data index block)

Note: this optimization was introduced in HBase 0.95+

HFiles contain many blocks that contain a range of sorted Cells.
Each cell has a key.
To save IO when reading Cells, the HFile also has an index that maps a Cell's start key to the offset of the beginning of a particular block.
Prior to this optimization, HBase would use the key of the first cell in each data block as the index key.

In HBASE-7845, we generate a new key that is lexicographically larger than the last key of the previous block and lexicographically equal or smaller than the start key of the current block.
While actual keys can potentially be very long, this "fake key" or "virtual key" can be much shorter.
For example, if the stop key of previous block is "the quick brown fox", the start key of current block is "the who", we could use "the r" as our virtual key in our hfile index.

There are two benefits to this:

* having shorter keys reduces the hfile index size, (allowing us to keep more indexes in memory), and
* using something closer to the end key of the previous block allows us to avoid a potential extra IO when the target key lives in between the "virtual key" and the key of the first element in the target block.

This optimization (implemented by the getShortMidpointKey method) is inspired by LevelDB's ByteWiseComparatorImpl::FindShortestSeparator() and FindShortSuccessor().

## HBase File Format with Security Enhancements (version 3)

Note: this feature was introduced in HBase 0.98

### Motivation

Version 3 of HFile makes changes needed to ease management of encryption at rest and cell-level metadata (which in turn is needed for cell-level ACLs and cell-level visibility labels). For more information see [hbase.encryption.server](/docs/security/data-access#transparent-encryption-of-data-at-rest), [hbase.tags](/docs/security/data-access#tags), [hbase.accesscontrol.configuration](/docs/hbase-incompatibilities#interface-accesscontrolconstants), and [hbase.visibility.labels](/docs/security/data-access#visibility-labels).

### Overview

The version of HBase introducing the above features reads HFiles in versions 1, 2, and 3 but only writes version 3 HFiles.
Version 3 HFiles are structured the same as version 2 HFiles.
For more information see [hfilev2.overview](/docs/hfile-format#overview-of-version-2).

### File Info Block in Version 3

Version 3 added two additional pieces of information to the reserved keys in the file info block.

| Key                    | Description                                                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| hfile.MAX\\_TAGS\\_LEN   | The maximum number of bytes needed to store the serialized tags for any single cell in this hfile (int)                         |
| hfile.TAGS\\_COMPRESSED | Does the block encoder for this hfile compress tags? (boolean). Should only be present if hfile.MAX\\_TAGS\\_LEN is also present. |

When reading a Version 3 HFile the presence of \`MAX_TAGS_LEN\` is used to determine how to deserialize the cells within a data block.
Therefore, consumers must read the file's info block prior to reading any data blocks.

When writing a Version 3 HFile, HBase will always include \`MAX_TAGS_LEN\` when flushing the memstore to underlying filesystem.

When compacting extant files, the default writer will omit \`MAX_TAGS_LEN\` if all of the files selected do not themselves contain any cells with tags.

See [compaction](/docs/architecture/regions#compaction) for details on the compaction file selection algorithm.

### Data Blocks in Version 3

Within an HFile, HBase cells are stored in data blocks as a sequence of KeyValues (see [hfilev1.overview](/docs/hfile-format#overview-of-version-1), or [Lars George's
excellent introduction to HBase Storage](http://www.larsgeorge.com/2009/10/hbase-architecture-101-storage.html)). In version 3, these KeyValue optionally will include a set of 0 or more tags:

|                        | Version 1 & 2, Version 3 without MAX\\_TAGS\\_LEN | Version 3 with MAX\\_TAGS\\_LEN |
| ---------------------- | ----------------------------------------------- | ----------------------------- |
| Key Length (4 bytes)   | ✓                                               | ✓                             |
| Value Length (4 bytes) | ✓                                               | ✓                             |
| Key bytes (variable)   | ✓                                               | ✓                             |
| Value bytes (variable) | ✓                                               | ✓                             |
| Tags Length (2 bytes)  |                                                 | ✓                             |
| Tags bytes (variable)  |                                                 | ✓                             |

If the info block for a given HFile contains an entry for \`MAX_TAGS_LEN\` each cell will have the length of that cell's tags included, even if that length is zero.
The actual tags are stored as a sequence of tag length (2 bytes), tag type (1 byte), tag bytes (variable). The format an individual tag's bytes depends on the tag type.

Note that the dependence on the contents of the info block implies that prior to reading any data blocks you must first process a file's info block.
It also implies that prior to writing a data block you must know if the file's info block will include \`MAX_TAGS_LEN\`.

### Fixed File Trailer in Version 3

The fixed file trailers written with HFile version 3 are always serialized with protocol buffers.
Additionally, it adds an optional field to the version 2 protocol buffer named encryption\\_key.
If HBase is configured to encrypt HFiles this field will store a data encryption key for this particular HFile, encrypted with the current cluster master key using AES.
For more information see [hbase.encryption.server](/docs/security/data-access#transparent-encryption-of-data-at-rest).
`,d={title:"HFile Format",description:"This appendix describes the evolution of the HFile format."},c=[{href:"/docs/security/data-access#transparent-encryption-of-data-at-rest"},{href:"/docs/security/data-access#tags"},{href:"/docs/hbase-incompatibilities#interface-accesscontrolconstants"},{href:"/docs/security/data-access#visibility-labels"},{href:"/docs/hfile-format#overview-of-version-2"},{href:"/docs/architecture/regions#compaction"},{href:"/docs/hfile-format#overview-of-version-1"},{href:"http://www.larsgeorge.com/2009/10/hbase-architecture-101-storage.html"},{href:"/docs/security/data-access#transparent-encryption-of-data-at-rest"}],h={contents:[{heading:"hbase-file-format-version-1",content:"As we will be discussing changes to the HFile format, it is useful to give a short overview of the original (HFile version 1) format."},{heading:"overview-of-version-1",content:"An HFile in version 1 format is structured as follows:"},{heading:"block-index-format-in-version-1",content:`The block index in version 1 is very straightforward.
For each entry, it contains:`},{heading:"block-index-format-in-version-1",content:"Offset (long)"},{heading:"block-index-format-in-version-1",content:"Uncompressed size (int)"},{heading:"block-index-format-in-version-1",content:"Key (a serialized byte array written using Bytes.writeByteArray)"},{heading:"block-index-format-in-version-1",content:"Key length as a variable-length integer (VInt)"},{heading:"block-index-format-in-version-1",content:"Key bytes"},{heading:"block-index-format-in-version-1",content:`The number of entries in the block index is stored in the fixed file trailer, and has to be passed in to the method that reads the block index.
One of the limitations of the block index in version 1 is that it does not provide the compressed size of a block, which turns out to be necessary for decompression.
Therefore, the HFile reader has to infer this compressed size from the offset difference between blocks.
We fix this limitation in version 2, where we store on-disk block size instead of uncompressed size, and get uncompressed size from the block header.`},{heading:"hbase-file-format-with-inline-blocks-version-2",content:"Note: this feature was introduced in HBase 0.92"},{heading:"motivation",content:`We found it necessary to revise the HFile format after encountering high memory usage and slow startup times caused by large Bloom filters and block indexes in the region server.
Bloom filters can get as large as 100 MB per HFile, which adds up to 2 GB when aggregated over 20 regions.
Block indexes can grow as large as 6 GB in aggregate size over the same set of regions.
A region is not considered opened until all of its block index data is loaded.
Large Bloom filters produce a different performance problem: the first get request that requires a Bloom filter lookup will incur the latency of loading the entire Bloom filter bit array.`},{heading:"motivation",content:`To speed up region server startup we break Bloom filters and block indexes into multiple blocks and write those blocks out as they fill up, which also reduces the HFile writer's memory footprint.
In the Bloom filter case, "filling up a block" means accumulating enough keys to efficiently utilize a fixed-size bit array, and in the block index case we accumulate an "index block" of the desired size.
Bloom filter blocks and index blocks (we call these "inline blocks") become interspersed with data blocks, and as a side effect we can no longer rely on the difference between block offsets to determine data block length, as it was done in version 1.`},{heading:"motivation",content:`HFile is a low-level file format by design, and it should not deal with application-specific details such as Bloom filters, which are handled at StoreFile level.
Therefore, we call Bloom filter blocks in an HFile "inline" blocks.
We also supply HFile with an interface to write those inline blocks.`},{heading:"motivation",content:`Another format modification aimed at reducing the region server startup time is to use a contiguous "load-on-open" section that has to be loaded in memory at the time an HFile is being opened.
Currently, as an HFile opens, there are separate seek operations to read the trailer, data/meta indexes, and file info.
To read the Bloom filter, there are two more seek operations for its "data" and "meta" portions.
In version 2, we seek once to read the trailer and seek again to read everything else we need to open the file from a contiguous block.`},{heading:"overview-of-version-2",content:`The version of HBase introducing the above features reads both version 1 and 2 HFiles, but only writes version 2 HFiles.
A version 2 HFile is structured as follows:`},{heading:"unified-version-2-block-format",content:"In the version 2 every block in the data section contains the following fields:"},{heading:"unified-version-2-block-format",content:`8 bytes: Block type, a sequence of bytes equivalent to version 1's "magic records". Supported block types are:`},{heading:"unified-version-2-block-format",content:"DATA – data blocks"},{heading:"unified-version-2-block-format",content:"LEAF_INDEX – leaf-level index blocks in a multi-level-block-index"},{heading:"unified-version-2-block-format",content:"BLOOM_CHUNK – Bloom filter chunks"},{heading:"unified-version-2-block-format",content:"META – meta blocks (not used for Bloom filters in version 2 anymore)"},{heading:"unified-version-2-block-format",content:"INTERMEDIATE_INDEX – intermediate-level index blocks in a multi-level blockindex"},{heading:"unified-version-2-block-format",content:"ROOT_INDEX – root-level index blocks in a multi-level block index"},{heading:"unified-version-2-block-format",content:'FILE_INFO – the "file info" block, a small key-value map of metadata'},{heading:"unified-version-2-block-format",content:"BLOOM_META – a Bloom filter metadata block in the load-on-open section"},{heading:"unified-version-2-block-format",content:"TRAILER – a fixed-size file trailer. As opposed to the above, this is not an HFile v2 block but a fixed-size (for each HFile version) data structure"},{heading:"unified-version-2-block-format",content:"INDEX_V1 – this block type is only used for legacy HFile v1 block"},{heading:"unified-version-2-block-format",content:"Compressed size of the block's data, not including the header (int).Can be used for skipping the current data block when scanning HFile data."},{heading:"unified-version-2-block-format",content:"Uncompressed size of the block's data, not including the header (int)This is equal to the compressed size if the compression algorithm is NONE"},{heading:"unified-version-2-block-format",content:"File offset of the previous block of the same type (long)Can be used for seeking to the previous data/index block"},{heading:"unified-version-2-block-format",content:"Compressed data (or uncompressed data if the compression algorithm is NONE)."},{heading:"unified-version-2-block-format",content:"The above format of blocks is used in the following HFile sections:"},{heading:"scanned-block-section",content:`The section is named so because it contains all data blocks that need to be read when an HFile is scanned sequentially.
Also contains Leaf index blocks and Bloom chunk blocks.`},{heading:"non-scanned-block-section",content:`This section still contains unified-format v2 blocks but it does not have to be read when doing a sequential scan.
This section contains "meta" blocks and intermediate-level index blocks.`},{heading:"non-scanned-block-section",content:'We are supporting "meta" blocks in version 2 the same way they were supported in version 1, even though we do not store Bloom filter data in these blocks anymore.'},{heading:"block-index-in-version-2",content:"There are three types of block indexes in HFile version 2, stored in two different formats (root and non-root):"},{heading:"block-index-in-version-2",content:"Data index — version 2 multi-level block index, consisting of:"},{heading:"block-index-in-version-2",content:"Version 2 root index, stored in the data block index section of the file"},{heading:"block-index-in-version-2",content:"Optionally, version 2 intermediate levels, stored in the non-root format in the data index section of the file. Intermediate levels can only be present if leaf level blocks are present"},{heading:"block-index-in-version-2",content:"Optionally, version 2 leaf levels, stored in the non-root format inline with data blocks"},{heading:"block-index-in-version-2",content:"Meta index — version 2 root index format only, stored in the meta index section of the file"},{heading:"block-index-in-version-2",content:'Bloom index — version 2 root index format only, stored in the "load-on-open" section as part of Bloom filter metadata.'},{heading:"root-block-index-format-in-version-2",content:"This format applies to:"},{heading:"root-block-index-format-in-version-2",content:"Root level of the version 2 data index"},{heading:"root-block-index-format-in-version-2",content:"Entire meta and Bloom indexes in version 2, which are always single-level."},{heading:"root-block-index-format-in-version-2",content:"A version 2 root index block is a sequence of entries of the following format, similar to entries of a version 1 block index, but storing on-disk size instead of uncompressed size."},{heading:"root-block-index-format-in-version-2",content:"Offset (long)This offset may point to a data block or to a deeper-level index block."},{heading:"root-block-index-format-in-version-2",content:"On-disk size (int)"},{heading:"root-block-index-format-in-version-2",content:"Key (a serialized byte array stored using Bytes.writeByteArray)"},{heading:"root-block-index-format-in-version-2",content:"Key (VInt)"},{heading:"root-block-index-format-in-version-2",content:"Key bytes"},{heading:"root-block-index-format-in-version-2",content:`A single-level version 2 block index consists of just a single root index block.
To read a root index block of version 2, one needs to know the number of entries.
For the data index and the meta index the number of entries is stored in the trailer, and for the Bloom index it is stored in the compound Bloom filter metadata.`},{heading:"root-block-index-format-in-version-2",content:"For a multi-level block index we also store the following fields in the root index block in the load-on-open section of the HFile, in addition to the data structure described above:"},{heading:"root-block-index-format-in-version-2",content:"Middle leaf index block offset"},{heading:"root-block-index-format-in-version-2",content:'Middle leaf block on-disk size (meaning the leaf index block containing the reference to the "middle" data block of the file)'},{heading:"root-block-index-format-in-version-2",content:"The index of the mid-key (defined below) in the middle leaf-level block."},{heading:"root-block-index-format-in-version-2",content:`These additional fields are used to efficiently retrieve the mid-key of the HFile used in HFile splits, which we define as the first key of the block with a zero-based index of (n – 1) / 2, if the total number of blocks in the HFile is n.
This definition is consistent with how the mid-key was determined in HFile version 1, and is reasonable in general, because blocks are likely to be the same size on average, but we don't have any estimates on individual key/value pair sizes.`},{heading:"root-block-index-format-in-version-2",content:`When writing a version 2 HFile, the total number of data blocks pointed to by every leaf-level index block is kept track of.
When we finish writing and the total number of leaf-level blocks is determined, it is clear which leaf-level block contains the mid-key, and the fields listed above are computed.
When reading the HFile and the mid-key is requested, we retrieve the middle leaf index block (potentially from the block cache) and get the mid-key value from the appropriate position inside that leaf block.`},{heading:"non-root-block-index-format-in-version-2",content:`This format applies to intermediate-level and leaf index blocks of a version 2 multi-level data block index.
Every non-root index block is structured as follows.`},{heading:"non-root-block-index-format-in-version-2",content:"numEntries: the number of entries (int)."},{heading:"non-root-block-index-format-in-version-2",content:`entryOffsets: the "secondary index" of offsets of entries in the block, to facilitate
a quick binary search on the key (numEntries + 1 int values). The last value
is the total length of all entries in this index block. For example, in a non-root
index block with entry sizes 60, 80, 50 the "secondary index" will contain the
following int array: {0, 60, 140, 190}.`},{heading:"non-root-block-index-format-in-version-2",content:"Entries. Each entry contains:"},{heading:"non-root-block-index-format-in-version-2",content:"Offset of the block referenced by this entry in the file (long)"},{heading:"non-root-block-index-format-in-version-2",content:"On-disk size of the referenced block (int)"},{heading:"non-root-block-index-format-in-version-2",content:"Key. The length can be calculated from entryOffsets."},{heading:"bloom-filters-in-version-2",content:"In contrast with version 1, in a version 2 HFile Bloom filter metadata is stored in the load-on-open section of the HFile for quick startup."},{heading:"bloom-filters-in-version-2",content:"A compound Bloom filter."},{heading:"bloom-filters-in-version-2",content:"Bloom filter version = 3 (int). There used to be a DynamicByteBloomFilter class that had the Bloom filter version number 2"},{heading:"bloom-filters-in-version-2",content:"The total byte size of all compound Bloom filter chunks (long)"},{heading:"bloom-filters-in-version-2",content:"Number of hash functions (int)"},{heading:"bloom-filters-in-version-2",content:"Type of hash functions (int)"},{heading:"bloom-filters-in-version-2",content:"The total key count inserted into the Bloom filter (long)"},{heading:"bloom-filters-in-version-2",content:"The maximum total number of keys in the Bloom filter (long)"},{heading:"bloom-filters-in-version-2",content:"The number of chunks (int)"},{heading:"bloom-filters-in-version-2",content:"Comparator class used for Bloom filter keys, a UTF-8 encoded string stored using Bytes.writeByteArray"},{heading:"bloom-filters-in-version-2",content:"Bloom block index in the version 2 root block index format"},{heading:"file-info-format-in-versions-1-and-2",content:`The file info block is a serialized map from byte arrays to byte arrays, with the following keys, among others.
StoreFile-level logic adds more keys to this.`},{heading:"file-info-format-in-versions-1-and-2",content:"Key"},{heading:"file-info-format-in-versions-1-and-2",content:"Description"},{heading:"file-info-format-in-versions-1-and-2",content:"hfile.LASTKEY"},{heading:"file-info-format-in-versions-1-and-2",content:"The last key of the file (byte array)"},{heading:"file-info-format-in-versions-1-and-2",content:"hfile.AVG_KEY_LEN"},{heading:"file-info-format-in-versions-1-and-2",content:"The average key length in the file (int)"},{heading:"file-info-format-in-versions-1-and-2",content:"hfile.AVG_VALUE_LEN"},{heading:"file-info-format-in-versions-1-and-2",content:"The average value length in the file (int)"},{heading:"file-info-format-in-versions-1-and-2",content:`In version 2, we did not change the file format, but we moved the file info to
the final section of the file, which can be loaded as one block when the HFile
is being opened.`},{heading:"file-info-format-in-versions-1-and-2",content:`Also, we do not store the comparator in the version 2 file info anymore.
Instead, we store it in the fixed file trailer.
This is because we need to know the comparator at the time of parsing the load-on-open section of the HFile.`},{heading:"fixed-file-trailer-format-differences-between-versions-1-and-2",content:`The following table shows common and different fields between fixed file trailers in versions 1 and 2.
Note that the size of the trailer is different depending on the version, so it is "fixed" only within one version.
However, the version is always stored as the last four-byte integer in the file.`},{heading:"differences-between-hfile-versions-1-and-2",content:"Version 1"},{heading:"differences-between-hfile-versions-1-and-2",content:"Version 2"},{heading:"differences-between-hfile-versions-1-and-2",content:"File info offset (long)"},{heading:"differences-between-hfile-versions-1-and-2",content:"Data index offset (long)"},{heading:"differences-between-hfile-versions-1-and-2",content:"loadOnOpenOffset (long) The offset of the section that we need to load when opening the file."},{heading:"differences-between-hfile-versions-1-and-2",content:"Number of data index entries (int)"},{heading:"differences-between-hfile-versions-1-and-2",content:"metaIndexOffset (long) This field is not being used by the version 1 reader, so we removed it from version 2."},{heading:"differences-between-hfile-versions-1-and-2",content:"uncompressedDataIndexSize (long) The total uncompressed size of the whole data block index, including root-level, intermediate-level, and leaf-level blocks."},{heading:"differences-between-hfile-versions-1-and-2",content:"Number of meta index entries (int)"},{heading:"differences-between-hfile-versions-1-and-2",content:"Total uncompressed bytes (long)"},{heading:"differences-between-hfile-versions-1-and-2",content:"numEntries (int)"},{heading:"differences-between-hfile-versions-1-and-2",content:"numEntries (long)"},{heading:"differences-between-hfile-versions-1-and-2",content:"Compression codec: 0 = LZO, 1 = GZ, 2 = NONE (int)"},{heading:"differences-between-hfile-versions-1-and-2",content:"Compression codec: 0 = LZO, 1 = GZ, 2 = NONE (int)"},{heading:"differences-between-hfile-versions-1-and-2",content:"The number of levels in the data block index (int)"},{heading:"differences-between-hfile-versions-1-and-2",content:"firstDataBlockOffset (long) The offset of the first data block. Used when scanning."},{heading:"differences-between-hfile-versions-1-and-2",content:"lastDataBlockEnd (long) The offset of the first byte after the last key/value data block. We don't need to go beyond this offset when scanning."},{heading:"differences-between-hfile-versions-1-and-2",content:"Version: 1 (int)"},{heading:"differences-between-hfile-versions-1-and-2",content:"Version: 2 (int)"},{heading:"getshortmidpointkey-an-optimization-for-data-index-block",content:"Note: this optimization was introduced in HBase 0.95+"},{heading:"getshortmidpointkey-an-optimization-for-data-index-block",content:`HFiles contain many blocks that contain a range of sorted Cells.
Each cell has a key.
To save IO when reading Cells, the HFile also has an index that maps a Cell's start key to the offset of the beginning of a particular block.
Prior to this optimization, HBase would use the key of the first cell in each data block as the index key.`},{heading:"getshortmidpointkey-an-optimization-for-data-index-block",content:`In HBASE-7845, we generate a new key that is lexicographically larger than the last key of the previous block and lexicographically equal or smaller than the start key of the current block.
While actual keys can potentially be very long, this "fake key" or "virtual key" can be much shorter.
For example, if the stop key of previous block is "the quick brown fox", the start key of current block is "the who", we could use "the r" as our virtual key in our hfile index.`},{heading:"getshortmidpointkey-an-optimization-for-data-index-block",content:"There are two benefits to this:"},{heading:"getshortmidpointkey-an-optimization-for-data-index-block",content:"having shorter keys reduces the hfile index size, (allowing us to keep more indexes in memory), and"},{heading:"getshortmidpointkey-an-optimization-for-data-index-block",content:'using something closer to the end key of the previous block allows us to avoid a potential extra IO when the target key lives in between the "virtual key" and the key of the first element in the target block.'},{heading:"getshortmidpointkey-an-optimization-for-data-index-block",content:"This optimization (implemented by the getShortMidpointKey method) is inspired by LevelDB's ByteWiseComparatorImpl::FindShortestSeparator() and FindShortSuccessor()."},{heading:"hbase-file-format-with-security-enhancements-version-3",content:"Note: this feature was introduced in HBase 0.98"},{heading:"motivation-1",content:"Version 3 of HFile makes changes needed to ease management of encryption at rest and cell-level metadata (which in turn is needed for cell-level ACLs and cell-level visibility labels). For more information see hbase.encryption.server, hbase.tags, hbase.accesscontrol.configuration, and hbase.visibility.labels."},{heading:"hfile-format-with-inline-blocks-v2-overview",content:`The version of HBase introducing the above features reads HFiles in versions 1, 2, and 3 but only writes version 3 HFiles.
Version 3 HFiles are structured the same as version 2 HFiles.
For more information see hfilev2.overview.`},{heading:"file-info-block-in-version-3",content:"Version 3 added two additional pieces of information to the reserved keys in the file info block."},{heading:"file-info-block-in-version-3",content:"Key"},{heading:"file-info-block-in-version-3",content:"Description"},{heading:"file-info-block-in-version-3",content:"hfile.MAX_TAGS_LEN"},{heading:"file-info-block-in-version-3",content:"The maximum number of bytes needed to store the serialized tags for any single cell in this hfile (int)"},{heading:"file-info-block-in-version-3",content:"hfile.TAGS_COMPRESSED"},{heading:"file-info-block-in-version-3",content:"Does the block encoder for this hfile compress tags? (boolean). Should only be present if hfile.MAX_TAGS_LEN is also present."},{heading:"file-info-block-in-version-3",content:`When reading a Version 3 HFile the presence of MAX_TAGS_LEN is used to determine how to deserialize the cells within a data block.
Therefore, consumers must read the file's info block prior to reading any data blocks.`},{heading:"file-info-block-in-version-3",content:"When writing a Version 3 HFile, HBase will always include MAX_TAGS_LEN when flushing the memstore to underlying filesystem."},{heading:"file-info-block-in-version-3",content:"When compacting extant files, the default writer will omit MAX_TAGS_LEN if all of the files selected do not themselves contain any cells with tags."},{heading:"file-info-block-in-version-3",content:"See compaction for details on the compaction file selection algorithm."},{heading:"data-blocks-in-version-3",content:`Within an HFile, HBase cells are stored in data blocks as a sequence of KeyValues (see hfilev1.overview, or Lars George's
excellent introduction to HBase Storage). In version 3, these KeyValue optionally will include a set of 0 or more tags:`},{heading:"data-blocks-in-version-3",content:"Version 1 & 2, Version 3 without MAX_TAGS_LEN"},{heading:"data-blocks-in-version-3",content:"Version 3 with MAX_TAGS_LEN"},{heading:"data-blocks-in-version-3",content:"Key Length (4 bytes)"},{heading:"data-blocks-in-version-3",content:"✓"},{heading:"data-blocks-in-version-3",content:"✓"},{heading:"data-blocks-in-version-3",content:"Value Length (4 bytes)"},{heading:"data-blocks-in-version-3",content:"✓"},{heading:"data-blocks-in-version-3",content:"✓"},{heading:"data-blocks-in-version-3",content:"Key bytes (variable)"},{heading:"data-blocks-in-version-3",content:"✓"},{heading:"data-blocks-in-version-3",content:"✓"},{heading:"data-blocks-in-version-3",content:"Value bytes (variable)"},{heading:"data-blocks-in-version-3",content:"✓"},{heading:"data-blocks-in-version-3",content:"✓"},{heading:"data-blocks-in-version-3",content:"Tags Length (2 bytes)"},{heading:"data-blocks-in-version-3",content:"✓"},{heading:"data-blocks-in-version-3",content:"Tags bytes (variable)"},{heading:"data-blocks-in-version-3",content:"✓"},{heading:"data-blocks-in-version-3",content:`If the info block for a given HFile contains an entry for MAX_TAGS_LEN each cell will have the length of that cell's tags included, even if that length is zero.
The actual tags are stored as a sequence of tag length (2 bytes), tag type (1 byte), tag bytes (variable). The format an individual tag's bytes depends on the tag type.`},{heading:"data-blocks-in-version-3",content:`Note that the dependence on the contents of the info block implies that prior to reading any data blocks you must first process a file's info block.
It also implies that prior to writing a data block you must know if the file's info block will include MAX_TAGS_LEN.`},{heading:"fixed-file-trailer-in-version-3",content:`The fixed file trailers written with HFile version 3 are always serialized with protocol buffers.
Additionally, it adds an optional field to the version 2 protocol buffer named encryption_key.
If HBase is configured to encrypt HFiles this field will store a data encryption key for this particular HFile, encrypted with the current cluster master key using AES.
For more information see hbase.encryption.server.`}],headings:[{id:"hbase-file-format-version-1",content:"HBase File Format (version 1)"},{id:"overview-of-version-1",content:"Overview of Version 1"},{id:"block-index-format-in-version-1",content:"Block index format in version 1"},{id:"hbase-file-format-with-inline-blocks-version-2",content:"HBase file format with inline blocks (version 2)"},{id:"motivation",content:"Motivation"},{id:"overview-of-version-2",content:"Overview of Version 2"},{id:"unified-version-2-block-format",content:"Unified version 2 block format"},{id:"scanned-block-section",content:"Scanned block section"},{id:"non-scanned-block-section",content:"Non-scanned block section"},{id:"block-index-in-version-2",content:"Block index in version 2"},{id:"root-block-index-format-in-version-2",content:"Root block index format in version 2"},{id:"non-root-block-index-format-in-version-2",content:"Non-root block index format in version 2"},{id:"bloom-filters-in-version-2",content:"Bloom filters in version 2"},{id:"file-info-format-in-versions-1-and-2",content:"File Info format in versions 1 and 2"},{id:"fixed-file-trailer-format-differences-between-versions-1-and-2",content:"Fixed file trailer format differences between versions 1 and 2"},{id:"differences-between-hfile-versions-1-and-2",content:"Differences between HFile Versions 1 and 2"},{id:"getshortmidpointkey-an-optimization-for-data-index-block",content:"getShortMidpointKey (an optimization for data index block)"},{id:"hbase-file-format-with-security-enhancements-version-3",content:"HBase File Format with Security Enhancements (version 3)"},{id:"motivation-1",content:"Motivation"},{id:"hfile-format-with-inline-blocks-v2-overview",content:"Overview"},{id:"file-info-block-in-version-3",content:"File Info Block in Version 3"},{id:"data-blocks-in-version-3",content:"Data Blocks in Version 3"},{id:"fixed-file-trailer-in-version-3",content:"Fixed File Trailer in Version 3"}]};const f=[{depth:2,url:"#hbase-file-format-version-1",title:e.jsx(e.Fragment,{children:"HBase File Format (version 1)"})},{depth:3,url:"#overview-of-version-1",title:e.jsx(e.Fragment,{children:"Overview of Version 1"})},{depth:3,url:"#block-index-format-in-version-1",title:e.jsx(e.Fragment,{children:"Block index format in version 1"})},{depth:2,url:"#hbase-file-format-with-inline-blocks-version-2",title:e.jsx(e.Fragment,{children:"HBase file format with inline blocks (version 2)"})},{depth:3,url:"#motivation",title:e.jsx(e.Fragment,{children:"Motivation"})},{depth:3,url:"#overview-of-version-2",title:e.jsx(e.Fragment,{children:"Overview of Version 2"})},{depth:3,url:"#unified-version-2-block-format",title:e.jsx(e.Fragment,{children:"Unified version 2 block format"})},{depth:4,url:"#scanned-block-section",title:e.jsx(e.Fragment,{children:"Scanned block section"})},{depth:4,url:"#non-scanned-block-section",title:e.jsx(e.Fragment,{children:"Non-scanned block section"})},{depth:3,url:"#block-index-in-version-2",title:e.jsx(e.Fragment,{children:"Block index in version 2"})},{depth:3,url:"#root-block-index-format-in-version-2",title:e.jsx(e.Fragment,{children:"Root block index format in version 2"})},{depth:3,url:"#non-root-block-index-format-in-version-2",title:e.jsx(e.Fragment,{children:"Non-root block index format in version 2"})},{depth:3,url:"#bloom-filters-in-version-2",title:e.jsx(e.Fragment,{children:"Bloom filters in version 2"})},{depth:3,url:"#file-info-format-in-versions-1-and-2",title:e.jsx(e.Fragment,{children:"File Info format in versions 1 and 2"})},{depth:3,url:"#fixed-file-trailer-format-differences-between-versions-1-and-2",title:e.jsx(e.Fragment,{children:"Fixed file trailer format differences between versions 1 and 2"})},{depth:4,url:"#differences-between-hfile-versions-1-and-2",title:e.jsx(e.Fragment,{children:"Differences between HFile Versions 1 and 2"})},{depth:3,url:"#getshortmidpointkey-an-optimization-for-data-index-block",title:e.jsx(e.Fragment,{children:"getShortMidpointKey (an optimization for data index block)"})},{depth:2,url:"#hbase-file-format-with-security-enhancements-version-3",title:e.jsx(e.Fragment,{children:"HBase File Format with Security Enhancements (version 3)"})},{depth:3,url:"#motivation-1",title:e.jsx(e.Fragment,{children:"Motivation"})},{depth:3,url:"#hfile-format-with-inline-blocks-v2-overview",title:e.jsx(e.Fragment,{children:"Overview"})},{depth:3,url:"#file-info-block-in-version-3",title:e.jsx(e.Fragment,{children:"File Info Block in Version 3"})},{depth:3,url:"#data-blocks-in-version-3",title:e.jsx(e.Fragment,{children:"Data Blocks in Version 3"})},{depth:3,url:"#fixed-file-trailer-in-version-3",title:e.jsx(e.Fragment,{children:"Fixed File Trailer in Version 3"})}];function t(i){const n={a:"a",br:"br",code:"code",em:"em",h2:"h2",h3:"h3",h4:"h4",img:"img",li:"li",ol:"ol",p:"p",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...i.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.h2,{id:"hbase-file-format-version-1",children:"HBase File Format (version 1)"}),`
`,e.jsx(n.p,{children:"As we will be discussing changes to the HFile format, it is useful to give a short overview of the original (HFile version 1) format."}),`
`,e.jsx(n.h3,{id:"overview-of-version-1",children:"Overview of Version 1"}),`
`,e.jsx(n.p,{children:"An HFile in version 1 format is structured as follows:"}),`
`,e.jsx(n.p,{children:e.jsx(n.img,{alt:"HFile V1 Format",src:o,placeholder:"blur"})}),`
`,e.jsx(n.h3,{id:"block-index-format-in-version-1",children:"Block index format in version 1"}),`
`,e.jsx(n.p,{children:`The block index in version 1 is very straightforward.
For each entry, it contains:`}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsx(n.li,{children:"Offset (long)"}),`
`,e.jsx(n.li,{children:"Uncompressed size (int)"}),`
`,e.jsxs(n.li,{children:["Key (a serialized byte array written using Bytes.writeByteArray)",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Key length as a variable-length integer (VInt)"}),`
`,e.jsx(n.li,{children:"Key bytes"}),`
`]}),`
`]}),`
`]}),`
`,e.jsx(n.p,{children:`The number of entries in the block index is stored in the fixed file trailer, and has to be passed in to the method that reads the block index.
One of the limitations of the block index in version 1 is that it does not provide the compressed size of a block, which turns out to be necessary for decompression.
Therefore, the HFile reader has to infer this compressed size from the offset difference between blocks.
We fix this limitation in version 2, where we store on-disk block size instead of uncompressed size, and get uncompressed size from the block header.`}),`
`,e.jsx(n.h2,{id:"hbase-file-format-with-inline-blocks-version-2",children:"HBase file format with inline blocks (version 2)"}),`
`,e.jsx(n.p,{children:"Note: this feature was introduced in HBase 0.92"}),`
`,e.jsx(n.h3,{id:"motivation",children:"Motivation"}),`
`,e.jsx(n.p,{children:`We found it necessary to revise the HFile format after encountering high memory usage and slow startup times caused by large Bloom filters and block indexes in the region server.
Bloom filters can get as large as 100 MB per HFile, which adds up to 2 GB when aggregated over 20 regions.
Block indexes can grow as large as 6 GB in aggregate size over the same set of regions.
A region is not considered opened until all of its block index data is loaded.
Large Bloom filters produce a different performance problem: the first get request that requires a Bloom filter lookup will incur the latency of loading the entire Bloom filter bit array.`}),`
`,e.jsx(n.p,{children:`To speed up region server startup we break Bloom filters and block indexes into multiple blocks and write those blocks out as they fill up, which also reduces the HFile writer's memory footprint.
In the Bloom filter case, "filling up a block" means accumulating enough keys to efficiently utilize a fixed-size bit array, and in the block index case we accumulate an "index block" of the desired size.
Bloom filter blocks and index blocks (we call these "inline blocks") become interspersed with data blocks, and as a side effect we can no longer rely on the difference between block offsets to determine data block length, as it was done in version 1.`}),`
`,e.jsx(n.p,{children:`HFile is a low-level file format by design, and it should not deal with application-specific details such as Bloom filters, which are handled at StoreFile level.
Therefore, we call Bloom filter blocks in an HFile "inline" blocks.
We also supply HFile with an interface to write those inline blocks.`}),`
`,e.jsx(n.p,{children:`Another format modification aimed at reducing the region server startup time is to use a contiguous "load-on-open" section that has to be loaded in memory at the time an HFile is being opened.
Currently, as an HFile opens, there are separate seek operations to read the trailer, data/meta indexes, and file info.
To read the Bloom filter, there are two more seek operations for its "data" and "meta" portions.
In version 2, we seek once to read the trailer and seek again to read everything else we need to open the file from a contiguous block.`}),`
`,e.jsx(n.h3,{id:"overview-of-version-2",children:"Overview of Version 2"}),`
`,e.jsx(n.p,{children:`The version of HBase introducing the above features reads both version 1 and 2 HFiles, but only writes version 2 HFiles.
A version 2 HFile is structured as follows:`}),`
`,e.jsx(n.p,{children:e.jsx(n.img,{alt:"HFile Version 2 Structure",src:s,placeholder:"blur"})}),`
`,e.jsx(n.h3,{id:"unified-version-2-block-format",children:"Unified version 2 block format"}),`
`,e.jsx(n.p,{children:"In the version 2 every block in the data section contains the following fields:"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:[`8 bytes: Block type, a sequence of bytes equivalent to version 1's "magic records". Supported block types are:`,`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"DATA – data blocks"}),`
`,e.jsx(n.li,{children:"LEAF_INDEX – leaf-level index blocks in a multi-level-block-index"}),`
`,e.jsx(n.li,{children:"BLOOM_CHUNK – Bloom filter chunks"}),`
`,e.jsx(n.li,{children:"META – meta blocks (not used for Bloom filters in version 2 anymore)"}),`
`,e.jsx(n.li,{children:"INTERMEDIATE_INDEX – intermediate-level index blocks in a multi-level blockindex"}),`
`,e.jsx(n.li,{children:"ROOT_INDEX – root-level index blocks in a multi-level block index"}),`
`,e.jsx(n.li,{children:'FILE_INFO – the "file info" block, a small key-value map of metadata'}),`
`,e.jsx(n.li,{children:"BLOOM_META – a Bloom filter metadata block in the load-on-open section"}),`
`,e.jsx(n.li,{children:"TRAILER – a fixed-size file trailer. As opposed to the above, this is not an HFile v2 block but a fixed-size (for each HFile version) data structure"}),`
`,e.jsx(n.li,{children:"INDEX_V1 – this block type is only used for legacy HFile v1 block"}),`
`]}),`
`]}),`
`,e.jsxs(n.li,{children:["Compressed size of the block's data, not including the header (int).",e.jsx(n.br,{}),`
`,"Can be used for skipping the current data block when scanning HFile data."]}),`
`,e.jsxs(n.li,{children:["Uncompressed size of the block's data, not including the header (int)",e.jsx(n.br,{}),`
`,"This is equal to the compressed size if the compression algorithm is NONE"]}),`
`,e.jsxs(n.li,{children:["File offset of the previous block of the same type (long)",e.jsx(n.br,{}),`
`,"Can be used for seeking to the previous data/index block"]}),`
`,e.jsx(n.li,{children:"Compressed data (or uncompressed data if the compression algorithm is NONE)."}),`
`]}),`
`,e.jsx(n.p,{children:"The above format of blocks is used in the following HFile sections:"}),`
`,e.jsx(n.h4,{id:"scanned-block-section",children:"Scanned block section"}),`
`,e.jsx(n.p,{children:`The section is named so because it contains all data blocks that need to be read when an HFile is scanned sequentially.
Also contains Leaf index blocks and Bloom chunk blocks.`}),`
`,e.jsx(n.h4,{id:"non-scanned-block-section",children:"Non-scanned block section"}),`
`,e.jsx(n.p,{children:`This section still contains unified-format v2 blocks but it does not have to be read when doing a sequential scan.
This section contains "meta" blocks and intermediate-level index blocks.`}),`
`,e.jsx(n.p,{children:'We are supporting "meta" blocks in version 2 the same way they were supported in version 1, even though we do not store Bloom filter data in these blocks anymore.'}),`
`,e.jsx(n.h3,{id:"block-index-in-version-2",children:"Block index in version 2"}),`
`,e.jsx(n.p,{children:"There are three types of block indexes in HFile version 2, stored in two different formats (root and non-root):"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:["Data index — version 2 multi-level block index, consisting of:",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Version 2 root index, stored in the data block index section of the file"}),`
`,e.jsx(n.li,{children:"Optionally, version 2 intermediate levels, stored in the non-root format in the data index section of the file. Intermediate levels can only be present if leaf level blocks are present"}),`
`,e.jsx(n.li,{children:"Optionally, version 2 leaf levels, stored in the non-root format inline with data blocks"}),`
`]}),`
`]}),`
`,e.jsx(n.li,{children:"Meta index — version 2 root index format only, stored in the meta index section of the file"}),`
`,e.jsx(n.li,{children:'Bloom index — version 2 root index format only, stored in the "load-on-open" section as part of Bloom filter metadata.'}),`
`]}),`
`,e.jsx(n.h3,{id:"root-block-index-format-in-version-2",children:"Root block index format in version 2"}),`
`,e.jsx(n.p,{children:"This format applies to:"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsx(n.li,{children:"Root level of the version 2 data index"}),`
`,e.jsx(n.li,{children:"Entire meta and Bloom indexes in version 2, which are always single-level."}),`
`]}),`
`,e.jsx(n.p,{children:"A version 2 root index block is a sequence of entries of the following format, similar to entries of a version 1 block index, but storing on-disk size instead of uncompressed size."}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:["Offset (long)",e.jsx(n.br,{}),`
`,"This offset may point to a data block or to a deeper-level index block."]}),`
`,e.jsx(n.li,{children:"On-disk size (int)"}),`
`,e.jsx(n.li,{children:"Key (a serialized byte array stored using Bytes.writeByteArray)"}),`
`,e.jsx(n.li,{children:"Key (VInt)"}),`
`,e.jsx(n.li,{children:"Key bytes"}),`
`]}),`
`,e.jsx(n.p,{children:`A single-level version 2 block index consists of just a single root index block.
To read a root index block of version 2, one needs to know the number of entries.
For the data index and the meta index the number of entries is stored in the trailer, and for the Bloom index it is stored in the compound Bloom filter metadata.`}),`
`,e.jsx(n.p,{children:"For a multi-level block index we also store the following fields in the root index block in the load-on-open section of the HFile, in addition to the data structure described above:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Middle leaf index block offset"}),`
`,e.jsx(n.li,{children:'Middle leaf block on-disk size (meaning the leaf index block containing the reference to the "middle" data block of the file)'}),`
`,e.jsx(n.li,{children:"The index of the mid-key (defined below) in the middle leaf-level block."}),`
`]}),`
`,e.jsx(n.p,{children:`These additional fields are used to efficiently retrieve the mid-key of the HFile used in HFile splits, which we define as the first key of the block with a zero-based index of (n – 1) / 2, if the total number of blocks in the HFile is n.
This definition is consistent with how the mid-key was determined in HFile version 1, and is reasonable in general, because blocks are likely to be the same size on average, but we don't have any estimates on individual key/value pair sizes.`}),`
`,e.jsx(n.p,{children:`When writing a version 2 HFile, the total number of data blocks pointed to by every leaf-level index block is kept track of.
When we finish writing and the total number of leaf-level blocks is determined, it is clear which leaf-level block contains the mid-key, and the fields listed above are computed.
When reading the HFile and the mid-key is requested, we retrieve the middle leaf index block (potentially from the block cache) and get the mid-key value from the appropriate position inside that leaf block.`}),`
`,e.jsx(n.h3,{id:"non-root-block-index-format-in-version-2",children:"Non-root block index format in version 2"}),`
`,e.jsx(n.p,{children:`This format applies to intermediate-level and leaf index blocks of a version 2 multi-level data block index.
Every non-root index block is structured as follows.`}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsx(n.li,{children:"numEntries: the number of entries (int)."}),`
`,e.jsxs(n.li,{children:[`entryOffsets: the "secondary index" of offsets of entries in the block, to facilitate
a quick binary search on the key (`,e.jsx(n.code,{children:"numEntries + 1"}),` int values). The last value
is the total length of all entries in this index block. For example, in a non-root
index block with entry sizes 60, 80, 50 the "secondary index" will contain the
following int array: `,e.jsx(n.code,{children:"{0, 60, 140, 190}"}),"."]}),`
`,e.jsxs(n.li,{children:["Entries. Each entry contains:",`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Offset of the block referenced by this entry in the file (long)"}),`
`,e.jsx(n.li,{children:"On-disk size of the referenced block (int)"}),`
`,e.jsx(n.li,{children:"Key. The length can be calculated from entryOffsets."}),`
`]}),`
`]}),`
`]}),`
`,e.jsx(n.h3,{id:"bloom-filters-in-version-2",children:"Bloom filters in version 2"}),`
`,e.jsx(n.p,{children:"In contrast with version 1, in a version 2 HFile Bloom filter metadata is stored in the load-on-open section of the HFile for quick startup."}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"A compound Bloom filter."}),`
`,e.jsx(n.li,{children:"Bloom filter version = 3 (int). There used to be a DynamicByteBloomFilter class that had the Bloom filter version number 2"}),`
`,e.jsx(n.li,{children:"The total byte size of all compound Bloom filter chunks (long)"}),`
`,e.jsx(n.li,{children:"Number of hash functions (int)"}),`
`,e.jsx(n.li,{children:"Type of hash functions (int)"}),`
`,e.jsx(n.li,{children:"The total key count inserted into the Bloom filter (long)"}),`
`,e.jsx(n.li,{children:"The maximum total number of keys in the Bloom filter (long)"}),`
`,e.jsx(n.li,{children:"The number of chunks (int)"}),`
`,e.jsx(n.li,{children:"Comparator class used for Bloom filter keys, a UTF-8 encoded string stored using Bytes.writeByteArray"}),`
`,e.jsx(n.li,{children:"Bloom block index in the version 2 root block index format"}),`
`]}),`
`,e.jsx(n.h3,{id:"file-info-format-in-versions-1-and-2",children:"File Info format in versions 1 and 2"}),`
`,e.jsx(n.p,{children:`The file info block is a serialized map from byte arrays to byte arrays, with the following keys, among others.
StoreFile-level logic adds more keys to this.`}),`
`,e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Key"}),e.jsx(n.th,{children:"Description"})]})}),e.jsxs(n.tbody,{children:[e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"hfile.LASTKEY"}),e.jsx(n.td,{children:"The last key of the file (byte array)"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"hfile.AVG_KEY_LEN"}),e.jsx(n.td,{children:"The average key length in the file (int)"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"hfile.AVG_VALUE_LEN"}),e.jsx(n.td,{children:"The average value length in the file (int)"})]})]})]}),`
`,e.jsx(n.p,{children:`In version 2, we did not change the file format, but we moved the file info to
the final section of the file, which can be loaded as one block when the HFile
is being opened.`}),`
`,e.jsx(n.p,{children:`Also, we do not store the comparator in the version 2 file info anymore.
Instead, we store it in the fixed file trailer.
This is because we need to know the comparator at the time of parsing the load-on-open section of the HFile.`}),`
`,e.jsx(n.h3,{id:"fixed-file-trailer-format-differences-between-versions-1-and-2",children:"Fixed file trailer format differences between versions 1 and 2"}),`
`,e.jsx(n.p,{children:`The following table shows common and different fields between fixed file trailers in versions 1 and 2.
Note that the size of the trailer is different depending on the version, so it is "fixed" only within one version.
However, the version is always stored as the last four-byte integer in the file.`}),`
`,e.jsx(n.h4,{id:"differences-between-hfile-versions-1-and-2",children:"Differences between HFile Versions 1 and 2"}),`
`,e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Version 1"}),e.jsx(n.th,{children:"Version 2"})]})}),e.jsxs(n.tbody,{children:[e.jsxs(n.tr,{children:[e.jsx(n.td,{}),e.jsx(n.td,{children:"File info offset (long)"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Data index offset (long)"}),e.jsxs(n.td,{children:["loadOnOpenOffset (long) ",e.jsx(n.em,{children:"The offset of the section that we need to load when opening the file."})]})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{}),e.jsx(n.td,{children:"Number of data index entries (int)"})]}),e.jsxs(n.tr,{children:[e.jsxs(n.td,{children:["metaIndexOffset (long) ",e.jsx(n.em,{children:"This field is not being used by the version 1 reader, so we removed it from version 2."})]}),e.jsxs(n.td,{children:["uncompressedDataIndexSize (long) ",e.jsx(n.em,{children:"The total uncompressed size of the whole data block index, including root-level, intermediate-level, and leaf-level blocks."})]})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{}),e.jsx(n.td,{children:"Number of meta index entries (int)"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{}),e.jsx(n.td,{children:"Total uncompressed bytes (long)"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"numEntries (int)"}),e.jsx(n.td,{children:"numEntries (long)"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Compression codec: 0 = LZO, 1 = GZ, 2 = NONE (int)"}),e.jsx(n.td,{children:"Compression codec: 0 = LZO, 1 = GZ, 2 = NONE (int)"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{}),e.jsx(n.td,{children:"The number of levels in the data block index (int)"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{}),e.jsxs(n.td,{children:["firstDataBlockOffset (long) ",e.jsx(n.em,{children:"The offset of the first data block. Used when scanning."})]})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{}),e.jsxs(n.td,{children:["lastDataBlockEnd (long) ",e.jsx(n.em,{children:"The offset of the first byte after the last key/value data block. We don't need to go beyond this offset when scanning."})]})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Version: 1 (int)"}),e.jsx(n.td,{children:"Version: 2 (int)"})]})]})]}),`
`,e.jsx(n.h3,{id:"getshortmidpointkey-an-optimization-for-data-index-block",children:"getShortMidpointKey (an optimization for data index block)"}),`
`,e.jsx(n.p,{children:"Note: this optimization was introduced in HBase 0.95+"}),`
`,e.jsx(n.p,{children:`HFiles contain many blocks that contain a range of sorted Cells.
Each cell has a key.
To save IO when reading Cells, the HFile also has an index that maps a Cell's start key to the offset of the beginning of a particular block.
Prior to this optimization, HBase would use the key of the first cell in each data block as the index key.`}),`
`,e.jsx(n.p,{children:`In HBASE-7845, we generate a new key that is lexicographically larger than the last key of the previous block and lexicographically equal or smaller than the start key of the current block.
While actual keys can potentially be very long, this "fake key" or "virtual key" can be much shorter.
For example, if the stop key of previous block is "the quick brown fox", the start key of current block is "the who", we could use "the r" as our virtual key in our hfile index.`}),`
`,e.jsx(n.p,{children:"There are two benefits to this:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"having shorter keys reduces the hfile index size, (allowing us to keep more indexes in memory), and"}),`
`,e.jsx(n.li,{children:'using something closer to the end key of the previous block allows us to avoid a potential extra IO when the target key lives in between the "virtual key" and the key of the first element in the target block.'}),`
`]}),`
`,e.jsx(n.p,{children:"This optimization (implemented by the getShortMidpointKey method) is inspired by LevelDB's ByteWiseComparatorImpl::FindShortestSeparator() and FindShortSuccessor()."}),`
`,e.jsx(n.h2,{id:"hbase-file-format-with-security-enhancements-version-3",children:"HBase File Format with Security Enhancements (version 3)"}),`
`,e.jsx(n.p,{children:"Note: this feature was introduced in HBase 0.98"}),`
`,e.jsx(n.h3,{id:"motivation-1",children:"Motivation"}),`
`,e.jsxs(n.p,{children:["Version 3 of HFile makes changes needed to ease management of encryption at rest and cell-level metadata (which in turn is needed for cell-level ACLs and cell-level visibility labels). For more information see ",e.jsx(n.a,{href:"/docs/security/data-access#transparent-encryption-of-data-at-rest",children:"hbase.encryption.server"}),", ",e.jsx(n.a,{href:"/docs/security/data-access#tags",children:"hbase.tags"}),", ",e.jsx(n.a,{href:"/docs/hbase-incompatibilities#interface-accesscontrolconstants",children:"hbase.accesscontrol.configuration"}),", and ",e.jsx(n.a,{href:"/docs/security/data-access#visibility-labels",children:"hbase.visibility.labels"}),"."]}),`
`,e.jsx(n.h3,{id:"hfile-format-with-inline-blocks-v2-overview",children:"Overview"}),`
`,e.jsxs(n.p,{children:[`The version of HBase introducing the above features reads HFiles in versions 1, 2, and 3 but only writes version 3 HFiles.
Version 3 HFiles are structured the same as version 2 HFiles.
For more information see `,e.jsx(n.a,{href:"/docs/hfile-format#overview-of-version-2",children:"hfilev2.overview"}),"."]}),`
`,e.jsx(n.h3,{id:"file-info-block-in-version-3",children:"File Info Block in Version 3"}),`
`,e.jsx(n.p,{children:"Version 3 added two additional pieces of information to the reserved keys in the file info block."}),`
`,e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Key"}),e.jsx(n.th,{children:"Description"})]})}),e.jsxs(n.tbody,{children:[e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"hfile.MAX_TAGS_LEN"}),e.jsx(n.td,{children:"The maximum number of bytes needed to store the serialized tags for any single cell in this hfile (int)"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"hfile.TAGS_COMPRESSED"}),e.jsx(n.td,{children:"Does the block encoder for this hfile compress tags? (boolean). Should only be present if hfile.MAX_TAGS_LEN is also present."})]})]})]}),`
`,e.jsxs(n.p,{children:["When reading a Version 3 HFile the presence of ",e.jsx(n.code,{children:"MAX_TAGS_LEN"}),` is used to determine how to deserialize the cells within a data block.
Therefore, consumers must read the file's info block prior to reading any data blocks.`]}),`
`,e.jsxs(n.p,{children:["When writing a Version 3 HFile, HBase will always include ",e.jsx(n.code,{children:"MAX_TAGS_LEN"})," when flushing the memstore to underlying filesystem."]}),`
`,e.jsxs(n.p,{children:["When compacting extant files, the default writer will omit ",e.jsx(n.code,{children:"MAX_TAGS_LEN"})," if all of the files selected do not themselves contain any cells with tags."]}),`
`,e.jsxs(n.p,{children:["See ",e.jsx(n.a,{href:"/docs/architecture/regions#compaction",children:"compaction"})," for details on the compaction file selection algorithm."]}),`
`,e.jsx(n.h3,{id:"data-blocks-in-version-3",children:"Data Blocks in Version 3"}),`
`,e.jsxs(n.p,{children:["Within an HFile, HBase cells are stored in data blocks as a sequence of KeyValues (see ",e.jsx(n.a,{href:"/docs/hfile-format#overview-of-version-1",children:"hfilev1.overview"}),", or ",e.jsx(n.a,{href:"http://www.larsgeorge.com/2009/10/hbase-architecture-101-storage.html",children:`Lars George's
excellent introduction to HBase Storage`}),"). In version 3, these KeyValue optionally will include a set of 0 or more tags:"]}),`
`,e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{}),e.jsx(n.th,{children:"Version 1 & 2, Version 3 without MAX_TAGS_LEN"}),e.jsx(n.th,{children:"Version 3 with MAX_TAGS_LEN"})]})}),e.jsxs(n.tbody,{children:[e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Key Length (4 bytes)"}),e.jsx(n.td,{children:"✓"}),e.jsx(n.td,{children:"✓"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Value Length (4 bytes)"}),e.jsx(n.td,{children:"✓"}),e.jsx(n.td,{children:"✓"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Key bytes (variable)"}),e.jsx(n.td,{children:"✓"}),e.jsx(n.td,{children:"✓"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Value bytes (variable)"}),e.jsx(n.td,{children:"✓"}),e.jsx(n.td,{children:"✓"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Tags Length (2 bytes)"}),e.jsx(n.td,{}),e.jsx(n.td,{children:"✓"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Tags bytes (variable)"}),e.jsx(n.td,{}),e.jsx(n.td,{children:"✓"})]})]})]}),`
`,e.jsxs(n.p,{children:["If the info block for a given HFile contains an entry for ",e.jsx(n.code,{children:"MAX_TAGS_LEN"}),` each cell will have the length of that cell's tags included, even if that length is zero.
The actual tags are stored as a sequence of tag length (2 bytes), tag type (1 byte), tag bytes (variable). The format an individual tag's bytes depends on the tag type.`]}),`
`,e.jsxs(n.p,{children:[`Note that the dependence on the contents of the info block implies that prior to reading any data blocks you must first process a file's info block.
It also implies that prior to writing a data block you must know if the file's info block will include `,e.jsx(n.code,{children:"MAX_TAGS_LEN"}),"."]}),`
`,e.jsx(n.h3,{id:"fixed-file-trailer-in-version-3",children:"Fixed File Trailer in Version 3"}),`
`,e.jsxs(n.p,{children:[`The fixed file trailers written with HFile version 3 are always serialized with protocol buffers.
Additionally, it adds an optional field to the version 2 protocol buffer named encryption_key.
If HBase is configured to encrypt HFiles this field will store a data encryption key for this particular HFile, encrypted with the current cluster master key using AES.
For more information see `,e.jsx(n.a,{href:"/docs/security/data-access#transparent-encryption-of-data-at-rest",children:"hbase.encryption.server"}),"."]})]})}function m(i={}){const{wrapper:n}=i.components||{};return n?e.jsx(n,{...i,children:e.jsx(t,{...i})}):t(i)}export{l as _markdown,m as default,c as extractedReferences,d as frontmatter,h as structuredData,f as toc};
