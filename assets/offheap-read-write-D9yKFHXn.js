import{j as e}from"./components-BCHf_v1I.js";import{_ as s,a as n}from"./bytebuff-allocator-stats-C6KiUNbS.js";let f=`



## Overview

To help reduce P99/P999 RPC latencies, HBase 2.x has made the read and write path use a pool of offheap buffers. Cells are
allocated in offheap memory outside of the purview of the JVM garbage collector with attendent reduction in GC pressure.
In the write path, the request packet received from client will be read in on a pre-allocated offheap buffer and retained
offheap until those cells are successfully persisted to the WAL and Memstore. The memory data structure in Memstore does
not directly store the cell memory, but references the cells encoded in the offheap buffers. Similarly for the read path.
We'll try to read the block cache first and if a cache misses, we'll go to the HFile and read the respective block. The
workflow from reading blocks to sending cells to client does its best to avoid on-heap memory allocations reducing the
amount of work the GC has to do.

<img alt="Offheap Overview" src={__img0} />

For redress for the single mention of onheap in the read-section of the diagram above see [Read block from HDFS to offheap directly](/docs/offheap-read-write#read-block-from-hdfs-to-offheap-directly).

## Offheap read-path

In HBase-2.0.0, [HBASE-11425](https://issues.apache.org/jira/browse/HBASE-11425) changed the HBase read path so it
could hold the read-data off-heap avoiding copying of cached data (BlockCache) on to the java heap (for uncached data,
see note under the diagram in the section above). This reduces GC pauses given there is less garbage made and so less
to clear. The off-heap read path can have a performance that is similar or better to that of the on-heap LRU cache.
This feature is available since HBase 2.0.0. Refer to below blogs for more details and test results on off heaped read path
[Offheaping the Read Path in Apache HBase: Part 1 of 2](https://blogs.apache.org/hbase/entry/offheaping_the_read_path_in)
and [Offheap Read-Path in Production - The Alibaba story](https://blogs.apache.org/hbase/entry/offheap-read-path-in-production)

For an end-to-end off-heaped read-path, all you have to do is enable an off-heap backed [Off-heap Block Cache](/docs/architecture/regionserver#off-heap-block-cache)(BC).
To do this, configure *hbase.bucketcache.ioengine* to be *offheap* in *hbase-site.xml* (See [BucketCache Deploy Modes](/docs/architecture/regionserver#bucketcache-deploy-modes) to learn
more about *hbase.bucketcache.ioengine* options). Also specify the total capacity of the BC using \`hbase.bucketcache.size\`.
Please remember to adjust value of 'HBASE*OFFHEAPSIZE' in \\_hbase-env.sh* (See [BucketCache Example Configuration](/docs/architecture/regionserver#bucketcache-example-configuration) for help sizing and an example
enabling). This configuration is for specifying the maximum possible off-heap memory allocation for the RegionServer java
process. This should be bigger than the off-heap BC size to accommodate usage by other features making use of off-heap memory
such as Server RPC buffer pool and short-circuit reads (See discussion in [BucketCache Example Configuration](/docs/architecture/regionserver#bucketcache-example-configuration)).

Please keep in mind that there is no default for \`hbase.bucketcache.ioengine\` which means the \`BlockCache\` is OFF by default
(See the "Direct Memory Usage In HBase" info section in [BucketCache Example Configuration](/docs/architecture/regionserver#bucketcache-example-configuration)).

This is all you need to do to enable off-heap read path. Most buffers in HBase are already off-heap. With BC off-heap,
the read pipeline will copy data between HDFS and the server socket — caveat hbase.ipc.server.reservoir.initial.max —
sending results back to the client.

### Tuning the RPC buffer pool

It is possible to tune the ByteBuffer pool on the RPC server side used to accumulate the cell bytes and create result
cell blocks to send back to the client side. Use \`hbase.ipc.server.reservoir.enabled\` to turn this pool ON or OFF. By
default this pool is ON and available. HBase will create off-heap ByteBuffers and pool them them by default. Please
make sure not to turn this OFF if you want end-to-end off-heaping in read path.

If this pool is turned off, the server will create temp buffers onheap to accumulate the cell bytes and
make a result cell block. This can impact the GC on a highly read loaded server.

<Callout type="info">
  The config keys which start with prefix \`hbase.ipc.server.reservoir\` are deprecated in hbase-3.x
  (the internal pool implementation changed). If you are still in hbase-2.2.x or older, then just
  use the old config keys. Otherwise if in hbase-3.x or hbase-2.3.x+, please use the new config keys
  (See [deprecated and new configs in
  HBase3.x](/docs/offheap-read-write#read-block-from-hdfs-to-offheap-directly))
</Callout>

Next thing to tune is the ByteBuffer pool on the RPC server side. The user can tune this pool with respect to how
many buffers are in the pool and what should be the size of each ByteBuffer. Use the config
\`hbase.ipc.server.reservoir.initial.buffer.size\` to tune each of the buffer sizes. Default is 64KB for hbase-2.2.x
and less, changed to 65KB by default for hbase-2.3.x+
(see [HBASE-22532](https://issues.apache.org/jira/browse/HBASE-22532))

When the result size is larger than one 64KB (Default) ByteBuffer size, the server will try to grab more than one
ByteBuffer and make a result cell block out of a collection of fixed-sized ByteBuffers. When the pool is running
out of buffers, the server will skip the pool and create temporary on-heap buffers.

The maximum number of ByteBuffers in the pool can be tuned using the config \`hbase.ipc.server.reservoir.initial.max\`.
Its default is a factor of region server handlers count (See the config \`hbase.regionserver.handler.count\`). The
math is such that by default we consider 2 MB as the result cell block size per read result and each handler will be
handling a read. For 2 MB size, we need 32 buffers each of size 64 KB (See default buffer size in pool). So per handler
32 ByteBuffers(BB). We allocate twice this size as the max BBs count such that one handler can be creating the response
and handing it to the RPC Responder thread and then handling a new request creating a new response cell block (using
pooled buffers). Even if the responder could not send back the first TCP reply immediately, our count should allow that
we should still have enough buffers in our pool without having to make temporary buffers on the heap. Again for smaller
sized random row reads, tune this max count. These are lazily created buffers and the count is the max count to be pooled.

If you still see GC issues even after making end-to-end read path off-heap, look for issues in the appropriate buffer
pool. Check for the below RegionServer log line at INFO level in HBase2.x:

\`\`\`
Pool already reached its max capacity : XXX and no free buffers now. Consider increasing the value for 'hbase.ipc.server.reservoir.initial.max' ?
\`\`\`

Or the following log message in HBase3.x:

\`\`\`
Pool already reached its max capacity : XXX and no free buffers now. Consider increasing the value for 'hbase.server.allocator.max.buffer.count' ?
\`\`\`

The setting for *HBASE\\_OFFHEAPSIZE* in *hbase-env.sh* should consider this off heap buffer pool on the server side also.
We need to config this max off heap size for the RegionServer as a bit higher than the sum of this max pool size and
the off heap cache size. The TCP layer will also need to create direct bytebuffers for TCP communication. Also the DFS
client will need some off-heap to do its workings especially if short-circuit reads are configured. Allocating an extra
1 - 2 GB for the max direct memory size has worked in tests.

If you are using coprocessors and refer to the Cells in the read results, DO NOT store reference to these Cells out of
the scope of the CP hook methods. Some times the CPs want to store info about the cell (Like its row key) for considering
in the next CP hook call etc. For such cases, pls clone the required fields of the entire Cell as per the use cases.
\\[ See CellUtil#cloneXXX(Cell) APIs ]

## Read block from HDFS to offheap directly

In HBase-2.x, the RegionServer will read blocks from HDFS to a temporary onheap ByteBuffer and then flush to
the BucketCache. Even if the BucketCache is offheap, we will first pull the HDFS read onheap before writing
it out to the offheap BucketCache. We can observe much GC pressure when cache hit ratio low (e.g. a cacheHitRatio \\~ 60% ).
[HBASE-21879](https://issues.apache.org/jira/browse/HBASE-21879) addresses this issue (Requires hbase-2.3.x/hbase-3.x).
It depends on there being a supporting HDFS being in place (hadoop-2.10.x or hadoop-3.3.x) and it may require patching
HBase itself (as of this writing); see
[HBASE-21879 Read HFile's block to ByteBuffer directly instead of to byte for reducing young gc purpose](https://issues.apache.org/jira/browse/HBASE-21879).
Appropriately setup, reads from HDFS can be into offheap buffers passed offheap to the offheap BlockCache to cache.

For more details about the design and performance improvement, please see the
[Design Doc -Read HFile's block to Offheap](https://docs.google.com/document/d/1xSy9axGxafoH-Qc17zbD2Bd--rWjjI00xTWQZ8ZwI_E).

Here we will share some best practice about the performance tuning but first we introduce new (hbase-3.x/hbase-2.3.x) configuration names
that go with the new internal pool implementation (\`ByteBuffAllocator\` vs the old \`ByteBufferPool\`), some of which mimic now deprecated
hbase-2.2.x configurations discussed above in the [Tuning the RPC buffer pool](/docs/offheap-read-write#tuning-the-rpc-buffer-pool). Much of the advice here overlaps that given above
in the [Tuning the RPC buffer pool](/docs/offheap-read-write#tuning-the-rpc-buffer-pool) since the implementations have similar configurations.

1. \`hbase.server.allocator.pool.enabled\` is for whether the RegionServer will use the pooled offheap ByteBuffer allocator. Default
   value is true. In hbase-2.x, the deprecated \`hbase.ipc.server.reservoir.enabled\` did similar and is mapped to this config
   until support for the old configuration is removed. This new name will be used in hbase-3.x and hbase-2.3.x+.
2. \`hbase.server.allocator.minimal.allocate.size\` is the threshold at which we start allocating from the pool. Otherwise the
   request will be allocated from onheap directly because it would be wasteful allocating small stuff from our pool of fixed-size
   ByteBuffers. The default minimum is \`hbase.server.allocator.buffer.size/6\`.
3. \`hbase.server.allocator.max.buffer.count\`: The \`ByteBuffAllocator\`, the new pool/reservoir implementation, has fixed-size
   ByteBuffers. This config is for how many buffers to pool. Its default value is 2MB \\_ 2 \\_ hbase.regionserver.handler.count / 65KB
   (similar to the discussion above in [Tuning the RPC buffer pool](/docs/offheap-read-write#tuning-the-rpc-buffer-pool)). If the default \`hbase.regionserver.handler.count\` is 30, then the default will be 1890.
4. \`hbase.server.allocator.buffer.size\`: The byte size of each ByteBuffer. The default value is 66560 (65KB), here we choose 65KB instead of 64KB
   because of [HBASE-22532](https://issues.apache.org/jira/browse/HBASE-22532).

The three config keys —\`hbase.ipc.server.reservoir.enabled\`, \`hbase.ipc.server.reservoir.initial.buffer.size\` and \`hbase.ipc.server.reservoir.initial.max\` — introduced in hbase-2.x
have been renamed and deprecated in hbase-3.x/hbase-2.3.x. Please use the new config keys instead:
\`hbase.server.allocator.pool.enabled\`, \`hbase.server.allocator.buffer.size\` and \`hbase.server.allocator.max.buffer.count\`.

Next, we have some suggestions regards performance.

**Please make sure that there are enough pooled DirectByteBuffer in your ByteBuffAllocator.**\\
The ByteBuffAllocator will allocate ByteBuffer from the DirectByteBuffer pool first. If
there's no available ByteBuffer in the pool, then we will allocate the ByteBuffers from onheap.
By default, we will pre-allocate 4MB for each RPC handler (The handler count is determined by the config:
\`hbase.regionserver.handler.count\`, it has the default value 30) . That's to say, if your \`hbase.server.allocator.buffer.size\`
is 65KB, then your pool will have 2MB \\_ 2 / 65KB \\_ 30 = 945 DirectByteBuffer. If you have a large scan and a big cache,
you may have a RPC response whose bytes size is greater than 2MB (another 2MB for receiving rpc request), then it will
be better to increase the \`hbase.server.allocator.max.buffer.count\`.

The RegionServer web UI has statistics on ByteBuffAllocator:

<img alt="ByteBuff Allocator Stats" src={__img1} />

If the following condition is met, you may need to increase your max buffer.count:

\`\`\`
heapAllocationRatio >= hbase.server.allocator.minimal.allocate.size / hbase.server.allocator.buffer.size * 100%
\`\`\`

**Please make sure the buffer size is greater than your block size.**\\
We have the default block size of 64KB, so almost all of the data blocks will be 64KB + a small delta, where the delta is
very small, depending on the size of the last Cell. If we set \`hbase.server.allocator.buffer.size\`=64KB,
then each block will be allocated as two ByteBuffers: one 64KB DirectByteBuffer and one HeapByteBuffer for the delta bytes.
Ideally, we should let the data block to be allocated as one ByteBuffer; it has a simpler data structure, faster access speed,
and less heap usage. Also, if the blocks are a composite of multiple ByteBuffers, to validate the checksum
we have to perform a temporary heap copy (see [HBASE-21917](https://issues.apache.org/jira/browse/HBASE-21917))
whereas if it's a single ByteBuffer we can speed the checksum by calling the hadoop' checksum native lib; it's more faster.

Please also see: [HBASE-22483](https://issues.apache.org/jira/browse/HBASE-22483)

Don't forget to up your *HBASE\\_OFFHEAPSIZE* accordingly.

## Offheap write-path

In hbase-2.x, [HBASE-15179](https://issues.apache.org/jira/browse/HBASE-15179) made the HBase write path work off-heap. By default, the MemStores in
HBase have always used MemStore Local Allocation Buffers (MSLABs) to avoid memory fragmentation; an MSLAB creates bigger fixed sized chunks and then the
MemStores Cell's data gets copied into these MSLAB chunks. These chunks can be pooled also and from hbase-2.x on, the MSLAB pool is by default ON.
Write off-heaping makes use of the MSLAB pool. It creates MSLAB chunks as Direct ByteBuffers and pools them.

\`hbase.regionserver.offheap.global.memstore.size\` is the configuration key which controls the amount of off-heap data. Its value is the number of megabytes
of off-heap memory that should be used by MSLAB (e.g. \`25\` would result in 25MB of off-heap). Be sure to increase *HBASE\\_OFFHEAPSIZE* which will set the JVM's
MaxDirectMemorySize property (see [Tuning the RPC buffer pool](/docs/offheap-read-write#tuning-the-rpc-buffer-pool) for more on *HBASE\\_OFFHEAPSIZE*). The default value of
\`hbase.regionserver.offheap.global.memstore.size\` is 0 which means MSLAB uses onheap, not offheap, chunks by default.

\`hbase.hregion.memstore.mslab.chunksize\` controls the size of each off-heap chunk. Default is \`2097152\` (2MB).

When a Cell is added to a MemStore, the bytes for that Cell are copied into these off-heap buffers (if \`hbase.regionserver.offheap.global.memstore.size\` is non-zero)
and a Cell POJO will refer to this memory area. This can greatly reduce the on-heap occupancy of the MemStores and reduce the total heap utilization for RegionServers
in a write-heavy workload. On-heap and off-heap memory utiliazation are tracked at multiple levels to implement low level and high level memory management.
The decision to flush a MemStore considers both the on-heap and off-heap usage of that MemStore. At the Region level, we sum the on-heap and off-heap usages and
compare them against the region flush size (128MB, by default). Globally, on-heap size occupancy of all memstores are tracked as well as off-heap size. When any of
these sizes breache the lower mark (\`hbase.regionserver.global.memstore.size.lower.limit\`) or the maximum size \`hbase.regionserver.global.memstore.size\`), all
regions are selected for forced flushes.
`,c={title:"RegionServer Off-Heap Read/Write Path",description:"Using off-heap memory for HBase read and write paths to reduce GC pressure and improve P99/P999 RPC latencies."},d=[{href:"/docs/offheap-read-write#read-block-from-hdfs-to-offheap-directly"},{href:"https://issues.apache.org/jira/browse/HBASE-11425"},{href:"https://blogs.apache.org/hbase/entry/offheaping_the_read_path_in"},{href:"https://blogs.apache.org/hbase/entry/offheap-read-path-in-production"},{href:"/docs/architecture/regionserver#off-heap-block-cache"},{href:"/docs/architecture/regionserver#bucketcache-deploy-modes"},{href:"/docs/architecture/regionserver#bucketcache-example-configuration"},{href:"/docs/architecture/regionserver#bucketcache-example-configuration"},{href:"/docs/architecture/regionserver#bucketcache-example-configuration"},{href:"/docs/offheap-read-write#read-block-from-hdfs-to-offheap-directly"},{href:"https://issues.apache.org/jira/browse/HBASE-22532"},{href:"https://issues.apache.org/jira/browse/HBASE-21879"},{href:"https://issues.apache.org/jira/browse/HBASE-21879"},{href:"https://docs.google.com/document/d/1xSy9axGxafoH-Qc17zbD2Bd--rWjjI00xTWQZ8ZwI_E"},{href:"/docs/offheap-read-write#tuning-the-rpc-buffer-pool"},{href:"/docs/offheap-read-write#tuning-the-rpc-buffer-pool"},{href:"/docs/offheap-read-write#tuning-the-rpc-buffer-pool"},{href:"https://issues.apache.org/jira/browse/HBASE-22532"},{href:"https://issues.apache.org/jira/browse/HBASE-21917"},{href:"https://issues.apache.org/jira/browse/HBASE-22483"},{href:"https://issues.apache.org/jira/browse/HBASE-15179"},{href:"/docs/offheap-read-write#tuning-the-rpc-buffer-pool"}],u={contents:[{heading:"offheap-read-write-overview",content:`To help reduce P99/P999 RPC latencies, HBase 2.x has made the read and write path use a pool of offheap buffers. Cells are
allocated in offheap memory outside of the purview of the JVM garbage collector with attendent reduction in GC pressure.
In the write path, the request packet received from client will be read in on a pre-allocated offheap buffer and retained
offheap until those cells are successfully persisted to the WAL and Memstore. The memory data structure in Memstore does
not directly store the cell memory, but references the cells encoded in the offheap buffers. Similarly for the read path.
We'll try to read the block cache first and if a cache misses, we'll go to the HFile and read the respective block. The
workflow from reading blocks to sending cells to client does its best to avoid on-heap memory allocations reducing the
amount of work the GC has to do.`},{heading:"offheap-read-write-overview",content:"For redress for the single mention of onheap in the read-section of the diagram above see Read block from HDFS to offheap directly."},{heading:"offheap-read-path",content:`In HBase-2.0.0, HBASE-11425 changed the HBase read path so it
could hold the read-data off-heap avoiding copying of cached data (BlockCache) on to the java heap (for uncached data,
see note under the diagram in the section above). This reduces GC pauses given there is less garbage made and so less
to clear. The off-heap read path can have a performance that is similar or better to that of the on-heap LRU cache.
This feature is available since HBase 2.0.0. Refer to below blogs for more details and test results on off heaped read path
Offheaping the Read Path in Apache HBase: Part 1 of 2
and Offheap Read-Path in Production - The Alibaba story`},{heading:"offheap-read-path",content:`For an end-to-end off-heaped read-path, all you have to do is enable an off-heap backed Off-heap Block Cache(BC).
To do this, configure *hbase.bucketcache.ioengine* to be *offheap* in *hbase-site.xml* (See BucketCache Deploy Modes to learn
more about *hbase.bucketcache.ioengine* options). Also specify the total capacity of the BC using \`hbase.bucketcache.size\`.
Please remember to adjust value of 'HBASE*OFFHEAPSIZE' in \\_hbase-env.sh* (See BucketCache Example Configuration for help sizing and an example
enabling). This configuration is for specifying the maximum possible off-heap memory allocation for the RegionServer java
process. This should be bigger than the off-heap BC size to accommodate usage by other features making use of off-heap memory
such as Server RPC buffer pool and short-circuit reads (See discussion in BucketCache Example Configuration).`},{heading:"offheap-read-path",content:'Please keep in mind that there is no default for `hbase.bucketcache.ioengine` which means the `BlockCache` is OFF by default\n(See the "Direct Memory Usage In HBase" info section in BucketCache Example Configuration).'},{heading:"offheap-read-path",content:`This is all you need to do to enable off-heap read path. Most buffers in HBase are already off-heap. With BC off-heap,
the read pipeline will copy data between HDFS and the server socket — caveat hbase.ipc.server.reservoir.initial.max —
sending results back to the client.`},{heading:"tuning-the-rpc-buffer-pool",content:`It is possible to tune the ByteBuffer pool on the RPC server side used to accumulate the cell bytes and create result
cell blocks to send back to the client side. Use \`hbase.ipc.server.reservoir.enabled\` to turn this pool ON or OFF. By
default this pool is ON and available. HBase will create off-heap ByteBuffers and pool them them by default. Please
make sure not to turn this OFF if you want end-to-end off-heaping in read path.`},{heading:"tuning-the-rpc-buffer-pool",content:`If this pool is turned off, the server will create temp buffers onheap to accumulate the cell bytes and
make a result cell block. This can impact the GC on a highly read loaded server.`},{heading:"tuning-the-rpc-buffer-pool",content:`The config keys which start with prefix \`hbase.ipc.server.reservoir\` are deprecated in hbase-3.x
(the internal pool implementation changed). If you are still in hbase-2.2.x or older, then just
use the old config keys. Otherwise if in hbase-3.x or hbase-2.3.x+, please use the new config keys
(See deprecated and new configs in
HBase3.x)`},{heading:"tuning-the-rpc-buffer-pool",content:`Next thing to tune is the ByteBuffer pool on the RPC server side. The user can tune this pool with respect to how
many buffers are in the pool and what should be the size of each ByteBuffer. Use the config
\`hbase.ipc.server.reservoir.initial.buffer.size\` to tune each of the buffer sizes. Default is 64KB for hbase-2.2.x
and less, changed to 65KB by default for hbase-2.3.x+
(see HBASE-22532)`},{heading:"tuning-the-rpc-buffer-pool",content:`When the result size is larger than one 64KB (Default) ByteBuffer size, the server will try to grab more than one
ByteBuffer and make a result cell block out of a collection of fixed-sized ByteBuffers. When the pool is running
out of buffers, the server will skip the pool and create temporary on-heap buffers.`},{heading:"tuning-the-rpc-buffer-pool",content:`The maximum number of ByteBuffers in the pool can be tuned using the config \`hbase.ipc.server.reservoir.initial.max\`.
Its default is a factor of region server handlers count (See the config \`hbase.regionserver.handler.count\`). The
math is such that by default we consider 2 MB as the result cell block size per read result and each handler will be
handling a read. For 2 MB size, we need 32 buffers each of size 64 KB (See default buffer size in pool). So per handler
32 ByteBuffers(BB). We allocate twice this size as the max BBs count such that one handler can be creating the response
and handing it to the RPC Responder thread and then handling a new request creating a new response cell block (using
pooled buffers). Even if the responder could not send back the first TCP reply immediately, our count should allow that
we should still have enough buffers in our pool without having to make temporary buffers on the heap. Again for smaller
sized random row reads, tune this max count. These are lazily created buffers and the count is the max count to be pooled.`},{heading:"tuning-the-rpc-buffer-pool",content:`If you still see GC issues even after making end-to-end read path off-heap, look for issues in the appropriate buffer
pool. Check for the below RegionServer log line at INFO level in HBase2.x:`},{heading:"tuning-the-rpc-buffer-pool",content:"Or the following log message in HBase3.x:"},{heading:"tuning-the-rpc-buffer-pool",content:`The setting for *HBASE\\_OFFHEAPSIZE* in *hbase-env.sh* should consider this off heap buffer pool on the server side also.
We need to config this max off heap size for the RegionServer as a bit higher than the sum of this max pool size and
the off heap cache size. The TCP layer will also need to create direct bytebuffers for TCP communication. Also the DFS
client will need some off-heap to do its workings especially if short-circuit reads are configured. Allocating an extra
1 - 2 GB for the max direct memory size has worked in tests.`},{heading:"tuning-the-rpc-buffer-pool",content:`If you are using coprocessors and refer to the Cells in the read results, DO NOT store reference to these Cells out of
the scope of the CP hook methods. Some times the CPs want to store info about the cell (Like its row key) for considering
in the next CP hook call etc. For such cases, pls clone the required fields of the entire Cell as per the use cases.
\\[ See CellUtil#cloneXXX(Cell) APIs ]`},{heading:"read-block-from-hdfs-to-offheap-directly",content:`In HBase-2.x, the RegionServer will read blocks from HDFS to a temporary onheap ByteBuffer and then flush to
the BucketCache. Even if the BucketCache is offheap, we will first pull the HDFS read onheap before writing
it out to the offheap BucketCache. We can observe much GC pressure when cache hit ratio low (e.g. a cacheHitRatio \\~ 60% ).
HBASE-21879 addresses this issue (Requires hbase-2.3.x/hbase-3.x).
It depends on there being a supporting HDFS being in place (hadoop-2.10.x or hadoop-3.3.x) and it may require patching
HBase itself (as of this writing); see
HBASE-21879 Read HFile's block to ByteBuffer directly instead of to byte for reducing young gc purpose.
Appropriately setup, reads from HDFS can be into offheap buffers passed offheap to the offheap BlockCache to cache.`},{heading:"read-block-from-hdfs-to-offheap-directly",content:`For more details about the design and performance improvement, please see the
Design Doc -Read HFile's block to Offheap.`},{heading:"read-block-from-hdfs-to-offheap-directly",content:"Here we will share some best practice about the performance tuning but first we introduce new (hbase-3.x/hbase-2.3.x) configuration names\nthat go with the new internal pool implementation (`ByteBuffAllocator` vs the old `ByteBufferPool`), some of which mimic now deprecated\nhbase-2.2.x configurations discussed above in the Tuning the RPC buffer pool. Much of the advice here overlaps that given above\nin the Tuning the RPC buffer pool since the implementations have similar configurations."},{heading:"read-block-from-hdfs-to-offheap-directly",content:"`hbase.server.allocator.pool.enabled` is for whether the RegionServer will use the pooled offheap ByteBuffer allocator. Default\nvalue is true. In hbase-2.x, the deprecated `hbase.ipc.server.reservoir.enabled` did similar and is mapped to this config\nuntil support for the old configuration is removed. This new name will be used in hbase-3.x and hbase-2.3.x+."},{heading:"read-block-from-hdfs-to-offheap-directly",content:"`hbase.server.allocator.minimal.allocate.size` is the threshold at which we start allocating from the pool. Otherwise the\nrequest will be allocated from onheap directly because it would be wasteful allocating small stuff from our pool of fixed-size\nByteBuffers. The default minimum is `hbase.server.allocator.buffer.size/6`."},{heading:"read-block-from-hdfs-to-offheap-directly",content:"`hbase.server.allocator.max.buffer.count`: The `ByteBuffAllocator`, the new pool/reservoir implementation, has fixed-size\nByteBuffers. This config is for how many buffers to pool. Its default value is 2MB \\_ 2 \\_ hbase.regionserver.handler.count / 65KB\n(similar to the discussion above in Tuning the RPC buffer pool). If the default `hbase.regionserver.handler.count` is 30, then the default will be 1890."},{heading:"read-block-from-hdfs-to-offheap-directly",content:"`hbase.server.allocator.buffer.size`: The byte size of each ByteBuffer. The default value is 66560 (65KB), here we choose 65KB instead of 64KB\nbecause of HBASE-22532."},{heading:"read-block-from-hdfs-to-offheap-directly",content:"The three config keys —`hbase.ipc.server.reservoir.enabled`, `hbase.ipc.server.reservoir.initial.buffer.size` and `hbase.ipc.server.reservoir.initial.max` — introduced in hbase-2.x\nhave been renamed and deprecated in hbase-3.x/hbase-2.3.x. Please use the new config keys instead:\n`hbase.server.allocator.pool.enabled`, `hbase.server.allocator.buffer.size` and `hbase.server.allocator.max.buffer.count`."},{heading:"read-block-from-hdfs-to-offheap-directly",content:"Next, we have some suggestions regards performance."},{heading:"read-block-from-hdfs-to-offheap-directly",content:`**Please make sure that there are enough pooled DirectByteBuffer in your ByteBuffAllocator.**\\
The ByteBuffAllocator will allocate ByteBuffer from the DirectByteBuffer pool first. If
there's no available ByteBuffer in the pool, then we will allocate the ByteBuffers from onheap.
By default, we will pre-allocate 4MB for each RPC handler (The handler count is determined by the config:
\`hbase.regionserver.handler.count\`, it has the default value 30) . That's to say, if your \`hbase.server.allocator.buffer.size\`
is 65KB, then your pool will have 2MB \\_ 2 / 65KB \\_ 30 = 945 DirectByteBuffer. If you have a large scan and a big cache,
you may have a RPC response whose bytes size is greater than 2MB (another 2MB for receiving rpc request), then it will
be better to increase the \`hbase.server.allocator.max.buffer.count\`.`},{heading:"read-block-from-hdfs-to-offheap-directly",content:"The RegionServer web UI has statistics on ByteBuffAllocator:"},{heading:"read-block-from-hdfs-to-offheap-directly",content:"If the following condition is met, you may need to increase your max buffer.count:"},{heading:"read-block-from-hdfs-to-offheap-directly",content:`**Please make sure the buffer size is greater than your block size.**\\
We have the default block size of 64KB, so almost all of the data blocks will be 64KB + a small delta, where the delta is
very small, depending on the size of the last Cell. If we set \`hbase.server.allocator.buffer.size\`=64KB,
then each block will be allocated as two ByteBuffers: one 64KB DirectByteBuffer and one HeapByteBuffer for the delta bytes.
Ideally, we should let the data block to be allocated as one ByteBuffer; it has a simpler data structure, faster access speed,
and less heap usage. Also, if the blocks are a composite of multiple ByteBuffers, to validate the checksum
we have to perform a temporary heap copy (see HBASE-21917)
whereas if it's a single ByteBuffer we can speed the checksum by calling the hadoop' checksum native lib; it's more faster.`},{heading:"read-block-from-hdfs-to-offheap-directly",content:"Please also see: HBASE-22483"},{heading:"read-block-from-hdfs-to-offheap-directly",content:"Don't forget to up your *HBASE\\_OFFHEAPSIZE* accordingly."},{heading:"offheap-write-path",content:`In hbase-2.x, HBASE-15179 made the HBase write path work off-heap. By default, the MemStores in
HBase have always used MemStore Local Allocation Buffers (MSLABs) to avoid memory fragmentation; an MSLAB creates bigger fixed sized chunks and then the
MemStores Cell's data gets copied into these MSLAB chunks. These chunks can be pooled also and from hbase-2.x on, the MSLAB pool is by default ON.
Write off-heaping makes use of the MSLAB pool. It creates MSLAB chunks as Direct ByteBuffers and pools them.`},{heading:"offheap-write-path",content:"`hbase.regionserver.offheap.global.memstore.size` is the configuration key which controls the amount of off-heap data. Its value is the number of megabytes\nof off-heap memory that should be used by MSLAB (e.g. `25` would result in 25MB of off-heap). Be sure to increase *HBASE\\_OFFHEAPSIZE* which will set the JVM's\nMaxDirectMemorySize property (see Tuning the RPC buffer pool for more on *HBASE\\_OFFHEAPSIZE*). The default value of\n`hbase.regionserver.offheap.global.memstore.size` is 0 which means MSLAB uses onheap, not offheap, chunks by default."},{heading:"offheap-write-path",content:"`hbase.hregion.memstore.mslab.chunksize` controls the size of each off-heap chunk. Default is `2097152` (2MB)."},{heading:"offheap-write-path",content:"When a Cell is added to a MemStore, the bytes for that Cell are copied into these off-heap buffers (if `hbase.regionserver.offheap.global.memstore.size` is non-zero)\nand a Cell POJO will refer to this memory area. This can greatly reduce the on-heap occupancy of the MemStores and reduce the total heap utilization for RegionServers\nin a write-heavy workload. On-heap and off-heap memory utiliazation are tracked at multiple levels to implement low level and high level memory management.\nThe decision to flush a MemStore considers both the on-heap and off-heap usage of that MemStore. At the Region level, we sum the on-heap and off-heap usages and\ncompare them against the region flush size (128MB, by default). Globally, on-heap size occupancy of all memstores are tracked as well as off-heap size. When any of\nthese sizes breache the lower mark (`hbase.regionserver.global.memstore.size.lower.limit`) or the maximum size `hbase.regionserver.global.memstore.size`), all\nregions are selected for forced flushes."}],headings:[{id:"offheap-read-write-overview",content:"Overview"},{id:"offheap-read-path",content:"Offheap read-path"},{id:"tuning-the-rpc-buffer-pool",content:"Tuning the RPC buffer pool"},{id:"read-block-from-hdfs-to-offheap-directly",content:"Read block from HDFS to offheap directly"},{id:"offheap-write-path",content:"Offheap write-path"}]},p=[{depth:2,url:"#offheap-read-write-overview",title:e.jsx(e.Fragment,{children:"Overview"})},{depth:2,url:"#offheap-read-path",title:e.jsx(e.Fragment,{children:"Offheap read-path"})},{depth:3,url:"#tuning-the-rpc-buffer-pool",title:e.jsx(e.Fragment,{children:"Tuning the RPC buffer pool"})},{depth:2,url:"#read-block-from-hdfs-to-offheap-directly",title:e.jsx(e.Fragment,{children:"Read block from HDFS to offheap directly"})},{depth:2,url:"#offheap-write-path",title:e.jsx(e.Fragment,{children:"Offheap write-path"})}];function r(o){const a={a:"a",br:"br",code:"code",em:"em",h2:"h2",h3:"h3",img:"img",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",...o.components},{Callout:t}=a;return t||i("Callout"),e.jsxs(e.Fragment,{children:[e.jsx(a.h2,{id:"offheap-read-write-overview",children:"Overview"}),`
`,e.jsx(a.p,{children:`To help reduce P99/P999 RPC latencies, HBase 2.x has made the read and write path use a pool of offheap buffers. Cells are
allocated in offheap memory outside of the purview of the JVM garbage collector with attendent reduction in GC pressure.
In the write path, the request packet received from client will be read in on a pre-allocated offheap buffer and retained
offheap until those cells are successfully persisted to the WAL and Memstore. The memory data structure in Memstore does
not directly store the cell memory, but references the cells encoded in the offheap buffers. Similarly for the read path.
We'll try to read the block cache first and if a cache misses, we'll go to the HFile and read the respective block. The
workflow from reading blocks to sending cells to client does its best to avoid on-heap memory allocations reducing the
amount of work the GC has to do.`}),`
`,e.jsx(a.p,{children:e.jsx(a.img,{alt:"Offheap Overview",src:s})}),`
`,e.jsxs(a.p,{children:["For redress for the single mention of onheap in the read-section of the diagram above see ",e.jsx(a.a,{href:"/docs/offheap-read-write#read-block-from-hdfs-to-offheap-directly",children:"Read block from HDFS to offheap directly"}),"."]}),`
`,e.jsx(a.h2,{id:"offheap-read-path",children:"Offheap read-path"}),`
`,e.jsxs(a.p,{children:["In HBase-2.0.0, ",e.jsx(a.a,{href:"https://issues.apache.org/jira/browse/HBASE-11425",children:"HBASE-11425"}),` changed the HBase read path so it
could hold the read-data off-heap avoiding copying of cached data (BlockCache) on to the java heap (for uncached data,
see note under the diagram in the section above). This reduces GC pauses given there is less garbage made and so less
to clear. The off-heap read path can have a performance that is similar or better to that of the on-heap LRU cache.
This feature is available since HBase 2.0.0. Refer to below blogs for more details and test results on off heaped read path
`,e.jsx(a.a,{href:"https://blogs.apache.org/hbase/entry/offheaping_the_read_path_in",children:"Offheaping the Read Path in Apache HBase: Part 1 of 2"}),`
and `,e.jsx(a.a,{href:"https://blogs.apache.org/hbase/entry/offheap-read-path-in-production",children:"Offheap Read-Path in Production - The Alibaba story"})]}),`
`,e.jsxs(a.p,{children:["For an end-to-end off-heaped read-path, all you have to do is enable an off-heap backed ",e.jsx(a.a,{href:"/docs/architecture/regionserver#off-heap-block-cache",children:"Off-heap Block Cache"}),`(BC).
To do this, configure `,e.jsx(a.em,{children:"hbase.bucketcache.ioengine"})," to be ",e.jsx(a.em,{children:"offheap"})," in ",e.jsx(a.em,{children:"hbase-site.xml"})," (See ",e.jsx(a.a,{href:"/docs/architecture/regionserver#bucketcache-deploy-modes",children:"BucketCache Deploy Modes"}),` to learn
more about `,e.jsx(a.em,{children:"hbase.bucketcache.ioengine"})," options). Also specify the total capacity of the BC using ",e.jsx(a.code,{children:"hbase.bucketcache.size"}),`.
Please remember to adjust value of 'HBASE`,e.jsx(a.em,{children:"OFFHEAPSIZE' in _hbase-env.sh"})," (See ",e.jsx(a.a,{href:"/docs/architecture/regionserver#bucketcache-example-configuration",children:"BucketCache Example Configuration"}),` for help sizing and an example
enabling). This configuration is for specifying the maximum possible off-heap memory allocation for the RegionServer java
process. This should be bigger than the off-heap BC size to accommodate usage by other features making use of off-heap memory
such as Server RPC buffer pool and short-circuit reads (See discussion in `,e.jsx(a.a,{href:"/docs/architecture/regionserver#bucketcache-example-configuration",children:"BucketCache Example Configuration"}),")."]}),`
`,e.jsxs(a.p,{children:["Please keep in mind that there is no default for ",e.jsx(a.code,{children:"hbase.bucketcache.ioengine"})," which means the ",e.jsx(a.code,{children:"BlockCache"}),` is OFF by default
(See the "Direct Memory Usage In HBase" info section in `,e.jsx(a.a,{href:"/docs/architecture/regionserver#bucketcache-example-configuration",children:"BucketCache Example Configuration"}),")."]}),`
`,e.jsx(a.p,{children:`This is all you need to do to enable off-heap read path. Most buffers in HBase are already off-heap. With BC off-heap,
the read pipeline will copy data between HDFS and the server socket — caveat hbase.ipc.server.reservoir.initial.max —
sending results back to the client.`}),`
`,e.jsx(a.h3,{id:"tuning-the-rpc-buffer-pool",children:"Tuning the RPC buffer pool"}),`
`,e.jsxs(a.p,{children:[`It is possible to tune the ByteBuffer pool on the RPC server side used to accumulate the cell bytes and create result
cell blocks to send back to the client side. Use `,e.jsx(a.code,{children:"hbase.ipc.server.reservoir.enabled"}),` to turn this pool ON or OFF. By
default this pool is ON and available. HBase will create off-heap ByteBuffers and pool them them by default. Please
make sure not to turn this OFF if you want end-to-end off-heaping in read path.`]}),`
`,e.jsx(a.p,{children:`If this pool is turned off, the server will create temp buffers onheap to accumulate the cell bytes and
make a result cell block. This can impact the GC on a highly read loaded server.`}),`
`,e.jsx(t,{type:"info",children:e.jsxs(a.p,{children:["The config keys which start with prefix ",e.jsx(a.code,{children:"hbase.ipc.server.reservoir"}),` are deprecated in hbase-3.x
(the internal pool implementation changed). If you are still in hbase-2.2.x or older, then just
use the old config keys. Otherwise if in hbase-3.x or hbase-2.3.x+, please use the new config keys
(See `,e.jsx(a.a,{href:"/docs/offheap-read-write#read-block-from-hdfs-to-offheap-directly",children:`deprecated and new configs in
HBase3.x`}),")"]})}),`
`,e.jsxs(a.p,{children:[`Next thing to tune is the ByteBuffer pool on the RPC server side. The user can tune this pool with respect to how
many buffers are in the pool and what should be the size of each ByteBuffer. Use the config
`,e.jsx(a.code,{children:"hbase.ipc.server.reservoir.initial.buffer.size"}),` to tune each of the buffer sizes. Default is 64KB for hbase-2.2.x
and less, changed to 65KB by default for hbase-2.3.x+
(see `,e.jsx(a.a,{href:"https://issues.apache.org/jira/browse/HBASE-22532",children:"HBASE-22532"}),")"]}),`
`,e.jsx(a.p,{children:`When the result size is larger than one 64KB (Default) ByteBuffer size, the server will try to grab more than one
ByteBuffer and make a result cell block out of a collection of fixed-sized ByteBuffers. When the pool is running
out of buffers, the server will skip the pool and create temporary on-heap buffers.`}),`
`,e.jsxs(a.p,{children:["The maximum number of ByteBuffers in the pool can be tuned using the config ",e.jsx(a.code,{children:"hbase.ipc.server.reservoir.initial.max"}),`.
Its default is a factor of region server handlers count (See the config `,e.jsx(a.code,{children:"hbase.regionserver.handler.count"}),`). The
math is such that by default we consider 2 MB as the result cell block size per read result and each handler will be
handling a read. For 2 MB size, we need 32 buffers each of size 64 KB (See default buffer size in pool). So per handler
32 ByteBuffers(BB). We allocate twice this size as the max BBs count such that one handler can be creating the response
and handing it to the RPC Responder thread and then handling a new request creating a new response cell block (using
pooled buffers). Even if the responder could not send back the first TCP reply immediately, our count should allow that
we should still have enough buffers in our pool without having to make temporary buffers on the heap. Again for smaller
sized random row reads, tune this max count. These are lazily created buffers and the count is the max count to be pooled.`]}),`
`,e.jsx(a.p,{children:`If you still see GC issues even after making end-to-end read path off-heap, look for issues in the appropriate buffer
pool. Check for the below RegionServer log line at INFO level in HBase2.x:`}),`
`,e.jsx(e.Fragment,{children:e.jsx(a.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(a.code,{children:e.jsx(a.span,{className:"line",children:e.jsx(a.span,{children:"Pool already reached its max capacity : XXX and no free buffers now. Consider increasing the value for 'hbase.ipc.server.reservoir.initial.max' ?"})})})})}),`
`,e.jsx(a.p,{children:"Or the following log message in HBase3.x:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(a.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(a.code,{children:e.jsx(a.span,{className:"line",children:e.jsx(a.span,{children:"Pool already reached its max capacity : XXX and no free buffers now. Consider increasing the value for 'hbase.server.allocator.max.buffer.count' ?"})})})})}),`
`,e.jsxs(a.p,{children:["The setting for ",e.jsx(a.em,{children:"HBASE_OFFHEAPSIZE"})," in ",e.jsx(a.em,{children:"hbase-env.sh"}),` should consider this off heap buffer pool on the server side also.
We need to config this max off heap size for the RegionServer as a bit higher than the sum of this max pool size and
the off heap cache size. The TCP layer will also need to create direct bytebuffers for TCP communication. Also the DFS
client will need some off-heap to do its workings especially if short-circuit reads are configured. Allocating an extra
1 - 2 GB for the max direct memory size has worked in tests.`]}),`
`,e.jsx(a.p,{children:`If you are using coprocessors and refer to the Cells in the read results, DO NOT store reference to these Cells out of
the scope of the CP hook methods. Some times the CPs want to store info about the cell (Like its row key) for considering
in the next CP hook call etc. For such cases, pls clone the required fields of the entire Cell as per the use cases.
[ See CellUtil#cloneXXX(Cell) APIs ]`}),`
`,e.jsx(a.h2,{id:"read-block-from-hdfs-to-offheap-directly",children:"Read block from HDFS to offheap directly"}),`
`,e.jsxs(a.p,{children:[`In HBase-2.x, the RegionServer will read blocks from HDFS to a temporary onheap ByteBuffer and then flush to
the BucketCache. Even if the BucketCache is offheap, we will first pull the HDFS read onheap before writing
it out to the offheap BucketCache. We can observe much GC pressure when cache hit ratio low (e.g. a cacheHitRatio ~ 60% ).
`,e.jsx(a.a,{href:"https://issues.apache.org/jira/browse/HBASE-21879",children:"HBASE-21879"}),` addresses this issue (Requires hbase-2.3.x/hbase-3.x).
It depends on there being a supporting HDFS being in place (hadoop-2.10.x or hadoop-3.3.x) and it may require patching
HBase itself (as of this writing); see
`,e.jsx(a.a,{href:"https://issues.apache.org/jira/browse/HBASE-21879",children:"HBASE-21879 Read HFile's block to ByteBuffer directly instead of to byte for reducing young gc purpose"}),`.
Appropriately setup, reads from HDFS can be into offheap buffers passed offheap to the offheap BlockCache to cache.`]}),`
`,e.jsxs(a.p,{children:[`For more details about the design and performance improvement, please see the
`,e.jsx(a.a,{href:"https://docs.google.com/document/d/1xSy9axGxafoH-Qc17zbD2Bd--rWjjI00xTWQZ8ZwI_E",children:"Design Doc -Read HFile's block to Offheap"}),"."]}),`
`,e.jsxs(a.p,{children:[`Here we will share some best practice about the performance tuning but first we introduce new (hbase-3.x/hbase-2.3.x) configuration names
that go with the new internal pool implementation (`,e.jsx(a.code,{children:"ByteBuffAllocator"})," vs the old ",e.jsx(a.code,{children:"ByteBufferPool"}),`), some of which mimic now deprecated
hbase-2.2.x configurations discussed above in the `,e.jsx(a.a,{href:"/docs/offheap-read-write#tuning-the-rpc-buffer-pool",children:"Tuning the RPC buffer pool"}),`. Much of the advice here overlaps that given above
in the `,e.jsx(a.a,{href:"/docs/offheap-read-write#tuning-the-rpc-buffer-pool",children:"Tuning the RPC buffer pool"})," since the implementations have similar configurations."]}),`
`,e.jsxs(a.ol,{children:[`
`,e.jsxs(a.li,{children:[e.jsx(a.code,{children:"hbase.server.allocator.pool.enabled"}),` is for whether the RegionServer will use the pooled offheap ByteBuffer allocator. Default
value is true. In hbase-2.x, the deprecated `,e.jsx(a.code,{children:"hbase.ipc.server.reservoir.enabled"}),` did similar and is mapped to this config
until support for the old configuration is removed. This new name will be used in hbase-3.x and hbase-2.3.x+.`]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.code,{children:"hbase.server.allocator.minimal.allocate.size"}),` is the threshold at which we start allocating from the pool. Otherwise the
request will be allocated from onheap directly because it would be wasteful allocating small stuff from our pool of fixed-size
ByteBuffers. The default minimum is `,e.jsx(a.code,{children:"hbase.server.allocator.buffer.size/6"}),"."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.code,{children:"hbase.server.allocator.max.buffer.count"}),": The ",e.jsx(a.code,{children:"ByteBuffAllocator"}),`, the new pool/reservoir implementation, has fixed-size
ByteBuffers. This config is for how many buffers to pool. Its default value is 2MB _ 2 _ hbase.regionserver.handler.count / 65KB
(similar to the discussion above in `,e.jsx(a.a,{href:"/docs/offheap-read-write#tuning-the-rpc-buffer-pool",children:"Tuning the RPC buffer pool"}),"). If the default ",e.jsx(a.code,{children:"hbase.regionserver.handler.count"})," is 30, then the default will be 1890."]}),`
`,e.jsxs(a.li,{children:[e.jsx(a.code,{children:"hbase.server.allocator.buffer.size"}),`: The byte size of each ByteBuffer. The default value is 66560 (65KB), here we choose 65KB instead of 64KB
because of `,e.jsx(a.a,{href:"https://issues.apache.org/jira/browse/HBASE-22532",children:"HBASE-22532"}),"."]}),`
`]}),`
`,e.jsxs(a.p,{children:["The three config keys —",e.jsx(a.code,{children:"hbase.ipc.server.reservoir.enabled"}),", ",e.jsx(a.code,{children:"hbase.ipc.server.reservoir.initial.buffer.size"})," and ",e.jsx(a.code,{children:"hbase.ipc.server.reservoir.initial.max"}),` — introduced in hbase-2.x
have been renamed and deprecated in hbase-3.x/hbase-2.3.x. Please use the new config keys instead:
`,e.jsx(a.code,{children:"hbase.server.allocator.pool.enabled"}),", ",e.jsx(a.code,{children:"hbase.server.allocator.buffer.size"})," and ",e.jsx(a.code,{children:"hbase.server.allocator.max.buffer.count"}),"."]}),`
`,e.jsx(a.p,{children:"Next, we have some suggestions regards performance."}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:"Please make sure that there are enough pooled DirectByteBuffer in your ByteBuffAllocator."}),e.jsx(a.br,{}),`
`,`The ByteBuffAllocator will allocate ByteBuffer from the DirectByteBuffer pool first. If
there's no available ByteBuffer in the pool, then we will allocate the ByteBuffers from onheap.
By default, we will pre-allocate 4MB for each RPC handler (The handler count is determined by the config:
`,e.jsx(a.code,{children:"hbase.regionserver.handler.count"}),", it has the default value 30) . That's to say, if your ",e.jsx(a.code,{children:"hbase.server.allocator.buffer.size"}),`
is 65KB, then your pool will have 2MB _ 2 / 65KB _ 30 = 945 DirectByteBuffer. If you have a large scan and a big cache,
you may have a RPC response whose bytes size is greater than 2MB (another 2MB for receiving rpc request), then it will
be better to increase the `,e.jsx(a.code,{children:"hbase.server.allocator.max.buffer.count"}),"."]}),`
`,e.jsx(a.p,{children:"The RegionServer web UI has statistics on ByteBuffAllocator:"}),`
`,e.jsx(a.p,{children:e.jsx(a.img,{alt:"ByteBuff Allocator Stats",src:n})}),`
`,e.jsx(a.p,{children:"If the following condition is met, you may need to increase your max buffer.count:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(a.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(a.code,{children:e.jsx(a.span,{className:"line",children:e.jsx(a.span,{children:"heapAllocationRatio >= hbase.server.allocator.minimal.allocate.size / hbase.server.allocator.buffer.size * 100%"})})})})}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:"Please make sure the buffer size is greater than your block size."}),e.jsx(a.br,{}),`
`,`We have the default block size of 64KB, so almost all of the data blocks will be 64KB + a small delta, where the delta is
very small, depending on the size of the last Cell. If we set `,e.jsx(a.code,{children:"hbase.server.allocator.buffer.size"}),`=64KB,
then each block will be allocated as two ByteBuffers: one 64KB DirectByteBuffer and one HeapByteBuffer for the delta bytes.
Ideally, we should let the data block to be allocated as one ByteBuffer; it has a simpler data structure, faster access speed,
and less heap usage. Also, if the blocks are a composite of multiple ByteBuffers, to validate the checksum
we have to perform a temporary heap copy (see `,e.jsx(a.a,{href:"https://issues.apache.org/jira/browse/HBASE-21917",children:"HBASE-21917"}),`)
whereas if it's a single ByteBuffer we can speed the checksum by calling the hadoop' checksum native lib; it's more faster.`]}),`
`,e.jsxs(a.p,{children:["Please also see: ",e.jsx(a.a,{href:"https://issues.apache.org/jira/browse/HBASE-22483",children:"HBASE-22483"})]}),`
`,e.jsxs(a.p,{children:["Don't forget to up your ",e.jsx(a.em,{children:"HBASE_OFFHEAPSIZE"})," accordingly."]}),`
`,e.jsx(a.h2,{id:"offheap-write-path",children:"Offheap write-path"}),`
`,e.jsxs(a.p,{children:["In hbase-2.x, ",e.jsx(a.a,{href:"https://issues.apache.org/jira/browse/HBASE-15179",children:"HBASE-15179"}),` made the HBase write path work off-heap. By default, the MemStores in
HBase have always used MemStore Local Allocation Buffers (MSLABs) to avoid memory fragmentation; an MSLAB creates bigger fixed sized chunks and then the
MemStores Cell's data gets copied into these MSLAB chunks. These chunks can be pooled also and from hbase-2.x on, the MSLAB pool is by default ON.
Write off-heaping makes use of the MSLAB pool. It creates MSLAB chunks as Direct ByteBuffers and pools them.`]}),`
`,e.jsxs(a.p,{children:[e.jsx(a.code,{children:"hbase.regionserver.offheap.global.memstore.size"}),` is the configuration key which controls the amount of off-heap data. Its value is the number of megabytes
of off-heap memory that should be used by MSLAB (e.g. `,e.jsx(a.code,{children:"25"})," would result in 25MB of off-heap). Be sure to increase ",e.jsx(a.em,{children:"HBASE_OFFHEAPSIZE"}),` which will set the JVM's
MaxDirectMemorySize property (see `,e.jsx(a.a,{href:"/docs/offheap-read-write#tuning-the-rpc-buffer-pool",children:"Tuning the RPC buffer pool"})," for more on ",e.jsx(a.em,{children:"HBASE_OFFHEAPSIZE"}),`). The default value of
`,e.jsx(a.code,{children:"hbase.regionserver.offheap.global.memstore.size"})," is 0 which means MSLAB uses onheap, not offheap, chunks by default."]}),`
`,e.jsxs(a.p,{children:[e.jsx(a.code,{children:"hbase.hregion.memstore.mslab.chunksize"})," controls the size of each off-heap chunk. Default is ",e.jsx(a.code,{children:"2097152"})," (2MB)."]}),`
`,e.jsxs(a.p,{children:["When a Cell is added to a MemStore, the bytes for that Cell are copied into these off-heap buffers (if ",e.jsx(a.code,{children:"hbase.regionserver.offheap.global.memstore.size"}),` is non-zero)
and a Cell POJO will refer to this memory area. This can greatly reduce the on-heap occupancy of the MemStores and reduce the total heap utilization for RegionServers
in a write-heavy workload. On-heap and off-heap memory utiliazation are tracked at multiple levels to implement low level and high level memory management.
The decision to flush a MemStore considers both the on-heap and off-heap usage of that MemStore. At the Region level, we sum the on-heap and off-heap usages and
compare them against the region flush size (128MB, by default). Globally, on-heap size occupancy of all memstores are tracked as well as off-heap size. When any of
these sizes breache the lower mark (`,e.jsx(a.code,{children:"hbase.regionserver.global.memstore.size.lower.limit"}),") or the maximum size ",e.jsx(a.code,{children:"hbase.regionserver.global.memstore.size"}),`), all
regions are selected for forced flushes.`]})]})}function b(o={}){const{wrapper:a}=o.components||{};return a?e.jsx(a,{...o,children:e.jsx(r,{...o})}):r(o)}function i(o,a){throw new Error("Expected component `"+o+"` to be defined: you likely forgot to import, pass, or provide it.")}export{f as _markdown,b as default,d as extractedReferences,c as frontmatter,u as structuredData,p as toc};
