import{j as e}from"./components-BCHf_v1I.js";let l=`## Background

A *Read Replica Cluster* is an entire HBase cluster running in global read-only mode against the same shared
storage (\`hbase.rootdir\`) as an active read-write cluster. Both clusters list the same HFiles in the same
HDFS / cloud-object-store location; no data is copied. Reads can be served from either cluster, letting the
read workload be fanned out across multiple clusters without doubling storage cost.

Typical use cases:

* Fan out heavy scan / analytical workloads off the primary cluster.
* Add cross-availability-zone read capacity backed by a single shared bucket.
* Stand up an isolated cluster for read-mostly experiments without copying data.

<Callout type="info">
  **Eventual consistency.** A replica only sees data once (a) the active cluster has flushed the
  data to HFiles in shared storage, and (b) the replica has been told to re-read shared storage via
  the \`refresh_meta\` and \`refresh_hfiles\` commands. MemStore data on the active cluster is invisible
  to the replica until flushed.
</Callout>

The parent design lives on [HBASE-29081](https://issues.apache.org/jira/browse/HBASE-29081).

## Design

The feature has three parts.

### Custom \`hbase:meta\` per cluster

Every cluster sharing a \`hbase.rootdir\` needs its own \`hbase:meta\` and its own master local region
directory, because region assignments and master-local state are node-scoped and cannot be shared. Other
system tables (\`hbase:acl\`, \`hbase:replication\`) *are* safe to share because their contents are storage-wide
and the replica never writes to them.

The configuration key \`hbase.meta.table.suffix\` selects a per-cluster suffix; the meta table becomes
\`hbase:meta_<suffix>\` and the master's local store directory becomes \`MasterData_<suffix>\`. Each cluster
sharing the same \`hbase.rootdir\` must be configured with a distinct suffix so its \`hbase:meta\` and
\`MasterData\` directory do not collide with any other cluster's. The suffix must match \`[a-zA-Z0-9]+\`.

### Global read-only mode

\`hbase.global.readonly.enabled=true\` puts a cluster into read-only mode. Five coprocessor controllers under
\`org.apache.hadoop.hbase.security.access\` intercept every user-table mutation path and throw
\`WriteAttemptedOnReadOnlyClusterException\` (a \`DoNotRetryIOException\`) with the message
\`Operation not allowed in Read-Only Mode\`:

| Class                            | Coprocessor host | Blocks                                                                                                |
| -------------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------- |
| \`MasterReadOnlyController\`       | Master           | DDL, snapshots, splits, merges, namespace ops, ACL/quota ops, replication-peer ops                    |
| \`RegionServerReadOnlyController\` | RegionServer     | WAL roll, replication sink mutations, log replay                                                      |
| \`RegionReadOnlyController\`       | Region           | put, delete, batchMutate, checkAnd\\*, append, increment, flush, compaction, WAL append, commit/replay |
| \`BulkLoadReadOnlyController\`     | Region           | bulk-load prepare/cleanup                                                                             |
| \`EndpointReadOnlyController\`     | Region           | all coprocessor endpoint invocations                                                                  |

Operators do not load these classes manually. \`CoprocessorConfigurationUtil.syncReadOnlyConfigurations\`
adds them to \`hbase.coprocessor.master.classes\`, \`hbase.coprocessor.regionserver.classes\`, and
\`hbase.coprocessor.region.classes\` at startup and on every dynamic
\`ConfigurationManager.notifyAllObservers\` event — so the flag can be flipped at runtime with
\`update_all_config\` (see Case 3).

### Preventing Multiple Active Clusters (active.cluster.suffix.id)

Two clusters writing to the same \`hbase.rootdir\` would corrupt shared storage. To enforce a single writer, an
active master creates a protobuf-serialized sentinel at \`<hbase.rootdir>/active.cluster.suffix.id\` recording
its cluster ID and meta suffix. \`MasterFileSystem.negotiateActiveClusterSuffixFile\` runs at master startup:

* An **active** cluster (\`hbase.global.readonly.enabled=false\`) creates the file if absent, or verifies its
  contents match its own identity. If the file belongs to another cluster, startup aborts with an
  \`IOException\`.
* A **replica** cluster (\`hbase.global.readonly.enabled=true\`) does not read or write the file; it logs
  \`[Read-replica feature] Replica cluster is being started in Read Only Mode\` and continues.

\`AbstractReadOnlyController.manageActiveClusterIdFile\` handles the dynamic toggle: switching to read-only
deletes the file if this cluster owns it, and switching back to read-write creates the file if absent.

## Configuration

On every node of the **read replica cluster**, add the following to \`hbase-site.xml\`:

\`\`\`xml
<property>
  <name>hbase.global.readonly.enabled</name>
  <value>true</value>
  <description>
    Put this cluster into global read-only mode. All user-table writes, flushes,
    compactions, splits, and merges are blocked. The five ReadOnly coprocessor
    controllers are loaded automatically.
  </description>
</property>
<property>
  <name>hbase.meta.table.suffix</name>
  <value>replica1</value>
  <description>
    Optional. If set, the meta table is named hbase:meta_<suffix> and the
    master's local store directory is MasterData_<suffix>. Value must match
    [a-zA-Z0-9]+. Each cluster sharing the same hbase.rootdir MUST be
    configured with a distinct suffix so its hbase:meta and MasterData
    directory do not collide with any other cluster's.
  </description>
</property>
\`\`\`

The **active cluster** uses the same \`hbase.rootdir\` but its own \`hbase.meta.table.suffix\` (distinct from
every replica's suffix), and leaves \`hbase.global.readonly.enabled\` unset or \`false\`.

\`hbase.global.readonly.enabled\` is a dynamic configuration — a config-change event reloads the read-only
coprocessors without restarting the process. All nodes must agree on the value; operators are responsible for
keeping every \`hbase-site.xml\` in sync before issuing \`update_all_config\`.

## Operation and maintenance

### Case 1. Bring up a new read replica cluster

1. Provision the replica cluster on hardware that can reach the active cluster's \`hbase.rootdir\` (typically
   the same HDFS or object store).
2. Set \`hbase.global.readonly.enabled=true\` in the replica's \`hbase-site.xml\`. And set up
   \`hbase.meta.table.suffix\`, to distinguish the replica cluster's meta table on the shared storage.
3. Start the cluster and verify if the Master log shows
   \`[Read-replica feature] Replica cluster is being started in Read Only Mode\`.
4. From the replica shell, run \`refresh_meta\` and then \`refresh_hfiles\` to materialize the active cluster's
   current state on the replica.

### Case 2. Routine sync after writes on the active cluster

\`\`\`ruby
# On the active cluster
hbase> flush 'my_namespace:my_table'
\`\`\`

\`\`\`ruby
# On the read replica cluster
hbase> refresh_meta
hbase> refresh_hfiles 'TABLE_NAME' => 'my_namespace:my_table'
\`\`\`

Always run \`refresh_meta\` first, then \`refresh_hfiles\`. \`refresh_hfiles\` only refreshes regions that are open
on the replica, so newly discovered regions must be in meta (and assigned) before their HFiles can be picked
up. \`refresh_hfiles\` supports three scopes:

\`\`\`ruby
hbase> refresh_hfiles                              # all user tables
hbase> refresh_hfiles 'TABLE_NAME' => 'ns:table'   # one table
hbase> refresh_hfiles 'NAMESPACE'  => 'ns'         # one namespace
\`\`\`

Passing both \`TABLE_NAME\` and \`NAMESPACE\` to \`refresh_hfiles\` is rejected. Both commands return a procedure
ID that can be tracked through the master UI or \`Admin.getProcedures()\`.

If the replica's block cache holds stale entries for a table that has just been refreshed, evict them with
the pre-existing \`clear_block_cache 'my_namespace:my_table'\` shell command.

\`Admin\` and \`AsyncAdmin\` expose the same operations programmatically:

\`\`\`java
long pid;
pid = admin.refreshMeta();
pid = admin.refreshHFiles();                              // all user tables
pid = admin.refreshHFiles(TableName.valueOf("ns:table")); // one table
pid = admin.refreshHFiles("ns");                          // one namespace
\`\`\`

### Case 3. Dynamically toggle read-only mode

\`hbase.global.readonly.enabled\` can be changed without a restart. Edit \`hbase-site.xml\` then
trigger a configuration refresh (for example, \`update_all_config\` from the shell). \`ConfigurationManager\`
notifies its observers, which load or unload the read-only coprocessors and call
\`AbstractReadOnlyController.manageActiveClusterIdFile\`:

* **false → true (becoming a replica):** the \`active.cluster.suffix.id\` file is deleted only if its contents
  match this cluster; if another cluster owns the file, it is left in place.
* **true → false (becoming active):** the file is recreated with this cluster's identity, unless it already
  exists.

In-flight batch operations are not interrupted; write operations submitted *after* the toggle throw
\`WriteAttemptedOnReadOnlyClusterException\`. The caller is responsible for handling and (if desired) resubmitting the failed
mutations.

### Case 4. Promote a replica when the active cluster is lost

1. Confirm the original active cluster is fully down.
2. If a stale \`active.cluster.suffix.id\` from the previous active is still present, remove it manually
   (e.g. \`hdfs dfs -rm <hbase.rootdir>/active.cluster.suffix.id\`, or the equivalent CLI for your object
   store). The new active master will refuse to start while a foreign sentinel file is in place.
3. Set \`hbase.global.readonly.enabled=false\` on the replica and apply the change (dynamic update or
   restart). The master writes a fresh sentinel file with this cluster's identity.

### Case 5. Recover from a blocked read-only transition

If you attempt to promote a replica to active (\`hbase.global.readonly.enabled=false\` + \`update_all_config\`)
while a different cluster's \`active.cluster.suffix.id\` file is still present, the transition is blocked. The
shell returns a \`ReadOnlyTransitionException\` and the cluster remains in read-only mode — writes continue to be
rejected with \`WriteAttemptedOnReadOnlyClusterException\`.

The server ERROR log includes the foreign cluster's ID:

\`\`\`
Cannot disable read-only mode. The active.cluster.suffix.id file contains a different
cluster ID (<foreign-id>), which means that cluster is already the active cluster.
Reverting hbase.global.readonly.enabled to true.
\`\`\`

<Callout type="info">
  A cluster whose promotion was blocked is still a replica — the read-only coprocessors remain
  loaded and writes are still rejected — even though its \`hbase-site.xml\` has
  \`hbase.global.readonly.enabled=false\`.
</Callout>

To recover, choose one of the following paths depending on whether the existing active cluster is still
running.

**Path A — the active cluster is still running:**

1. On the currently active cluster, set \`hbase.global.readonly.enabled=true\` in \`hbase-site.xml\` and run
   \`update_all_config\`. This converts it to a replica and deletes its \`active.cluster.suffix.id\` file.
2. On the cluster you want to promote, re-run \`update_all_config\`. The transition will now succeed — the
   cluster writes a fresh sentinel file with its own identity and unloads the read-only coprocessors.

**Path B — the active cluster is down or has already been converted to a replica:**

1. Confirm the cluster that owns the sentinel file is fully stopped or has already been converted to a replica.
2. Remove the foreign sentinel file:
   \`\`\`bash
   hdfs dfs -rm <hbase.rootdir>/active.cluster.suffix.id
   \`\`\`
3. On the cluster you want to promote, re-run \`update_all_config\`. The transition will now succeed — the
   cluster writes a fresh sentinel file with its own identity and unloads the read-only coprocessors.

<Callout type="warning">
  **Do not remove the sentinel file while the cluster that wrote it is still running as an active
  cluster.** Doing so would allow two clusters to write to the same shared storage simultaneously,
  risking data corruption.
</Callout>

## Configurations and Commands

### New configs

| Config                          | Default | Description                                                                                     |
| ------------------------------- | ------- | ----------------------------------------------------------------------------------------------- |
| \`hbase.meta.table.suffix\`       | \`""\`    | Adds a suffix to the meta table name. \`value='test'\` produces the table name \`hbase:meta_test\`. |
| \`hbase.global.readonly.enabled\` | \`false\` | Puts the entire cluster into read-only mode.                                                    |

### New commands

| Command          | Usage                                                                                                                                                                            | Description                                                                            |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| \`refresh_hfiles\` | \`refresh_hfiles\`<br />\`refresh_hfiles 'TABLE_NAME' => 'tablename'\`<br />\`refresh_hfiles 'TABLE_NAME' => 'namespace:test_table'\`<br />\`refresh_hfiles 'NAMESPACE' => 'namespace'\` | Refreshes HFiles from disk. Used to pick up new edits on the read replica.             |
| \`refresh_meta\`   | \`refresh_meta\`                                                                                                                                                                   | Syncs the meta table with the backing storage. Used to pick up new tables and regions. |
`,o={title:"Read Replica Cluster",description:"Running a secondary HBase cluster in read-only mode against shared cloud storage to scale read workloads."},c=[{href:"https://issues.apache.org/jira/browse/HBASE-29081"}],h={contents:[{heading:"read-replica-cluster-background",content:`A *Read Replica Cluster* is an entire HBase cluster running in global read-only mode against the same shared
storage (\`hbase.rootdir\`) as an active read-write cluster. Both clusters list the same HFiles in the same
HDFS / cloud-object-store location; no data is copied. Reads can be served from either cluster, letting the
read workload be fanned out across multiple clusters without doubling storage cost.`},{heading:"read-replica-cluster-background",content:"Typical use cases:"},{heading:"read-replica-cluster-background",content:"Fan out heavy scan / analytical workloads off the primary cluster."},{heading:"read-replica-cluster-background",content:"Add cross-availability-zone read capacity backed by a single shared bucket."},{heading:"read-replica-cluster-background",content:"Stand up an isolated cluster for read-mostly experiments without copying data."},{heading:"read-replica-cluster-background",content:"**Eventual consistency.** A replica only sees data once (a) the active cluster has flushed the\ndata to HFiles in shared storage, and (b) the replica has been told to re-read shared storage via\nthe `refresh_meta` and `refresh_hfiles` commands. MemStore data on the active cluster is invisible\nto the replica until flushed."},{heading:"read-replica-cluster-background",content:"The parent design lives on HBASE-29081."},{heading:"read-replica-cluster-design",content:"The feature has three parts."},{heading:"custom-hbasemeta-per-cluster",content:"Every cluster sharing a `hbase.rootdir` needs its own `hbase:meta` and its own master local region\ndirectory, because region assignments and master-local state are node-scoped and cannot be shared. Other\nsystem tables (`hbase:acl`, `hbase:replication`) *are* safe to share because their contents are storage-wide\nand the replica never writes to them."},{heading:"custom-hbasemeta-per-cluster",content:"The configuration key `hbase.meta.table.suffix` selects a per-cluster suffix; the meta table becomes\n`hbase:meta_<suffix>` and the master's local store directory becomes `MasterData_<suffix>`. Each cluster\nsharing the same `hbase.rootdir` must be configured with a distinct suffix so its `hbase:meta` and\n`MasterData` directory do not collide with any other cluster's. The suffix must match `[a-zA-Z0-9]+`."},{heading:"global-read-only-mode",content:"`hbase.global.readonly.enabled=true` puts a cluster into read-only mode. Five coprocessor controllers under\n`org.apache.hadoop.hbase.security.access` intercept every user-table mutation path and throw\n`WriteAttemptedOnReadOnlyClusterException` (a `DoNotRetryIOException`) with the message\n`Operation not allowed in Read-Only Mode`:"},{heading:"global-read-only-mode",content:"Class"},{heading:"global-read-only-mode",content:"Coprocessor host"},{heading:"global-read-only-mode",content:"Blocks"},{heading:"global-read-only-mode",content:"`MasterReadOnlyController`"},{heading:"global-read-only-mode",content:"Master"},{heading:"global-read-only-mode",content:"DDL, snapshots, splits, merges, namespace ops, ACL/quota ops, replication-peer ops"},{heading:"global-read-only-mode",content:"`RegionServerReadOnlyController`"},{heading:"global-read-only-mode",content:"RegionServer"},{heading:"global-read-only-mode",content:"WAL roll, replication sink mutations, log replay"},{heading:"global-read-only-mode",content:"`RegionReadOnlyController`"},{heading:"global-read-only-mode",content:"Region"},{heading:"global-read-only-mode",content:"put, delete, batchMutate, checkAnd\\*, append, increment, flush, compaction, WAL append, commit/replay"},{heading:"global-read-only-mode",content:"`BulkLoadReadOnlyController`"},{heading:"global-read-only-mode",content:"Region"},{heading:"global-read-only-mode",content:"bulk-load prepare/cleanup"},{heading:"global-read-only-mode",content:"`EndpointReadOnlyController`"},{heading:"global-read-only-mode",content:"Region"},{heading:"global-read-only-mode",content:"all coprocessor endpoint invocations"},{heading:"global-read-only-mode",content:"Operators do not load these classes manually. `CoprocessorConfigurationUtil.syncReadOnlyConfigurations`\nadds them to `hbase.coprocessor.master.classes`, `hbase.coprocessor.regionserver.classes`, and\n`hbase.coprocessor.region.classes` at startup and on every dynamic\n`ConfigurationManager.notifyAllObservers` event — so the flag can be flipped at runtime with\n`update_all_config` (see Case 3)."},{heading:"preventing-multiple-active-clusters-activeclustersuffixid",content:"Two clusters writing to the same `hbase.rootdir` would corrupt shared storage. To enforce a single writer, an\nactive master creates a protobuf-serialized sentinel at `<hbase.rootdir>/active.cluster.suffix.id` recording\nits cluster ID and meta suffix. `MasterFileSystem.negotiateActiveClusterSuffixFile` runs at master startup:"},{heading:"preventing-multiple-active-clusters-activeclustersuffixid",content:"An **active** cluster (`hbase.global.readonly.enabled=false`) creates the file if absent, or verifies its\ncontents match its own identity. If the file belongs to another cluster, startup aborts with an\n`IOException`."},{heading:"preventing-multiple-active-clusters-activeclustersuffixid",content:"A **replica** cluster (`hbase.global.readonly.enabled=true`) does not read or write the file; it logs\n`[Read-replica feature] Replica cluster is being started in Read Only Mode` and continues."},{heading:"preventing-multiple-active-clusters-activeclustersuffixid",content:"`AbstractReadOnlyController.manageActiveClusterIdFile` handles the dynamic toggle: switching to read-only\ndeletes the file if this cluster owns it, and switching back to read-write creates the file if absent."},{heading:"read-replica-cluster-configuration",content:"On every node of the **read replica cluster**, add the following to `hbase-site.xml`:"},{heading:"read-replica-cluster-configuration",content:"The **active cluster** uses the same `hbase.rootdir` but its own `hbase.meta.table.suffix` (distinct from\nevery replica's suffix), and leaves `hbase.global.readonly.enabled` unset or `false`."},{heading:"read-replica-cluster-configuration",content:"`hbase.global.readonly.enabled` is a dynamic configuration — a config-change event reloads the read-only\ncoprocessors without restarting the process. All nodes must agree on the value; operators are responsible for\nkeeping every `hbase-site.xml` in sync before issuing `update_all_config`."},{heading:"case-1-bring-up-a-new-read-replica-cluster",content:"Provision the replica cluster on hardware that can reach the active cluster's `hbase.rootdir` (typically\nthe same HDFS or object store)."},{heading:"case-1-bring-up-a-new-read-replica-cluster",content:"Set `hbase.global.readonly.enabled=true` in the replica's `hbase-site.xml`. And set up\n`hbase.meta.table.suffix`, to distinguish the replica cluster's meta table on the shared storage."},{heading:"case-1-bring-up-a-new-read-replica-cluster",content:"Start the cluster and verify if the Master log shows\n`[Read-replica feature] Replica cluster is being started in Read Only Mode`."},{heading:"case-1-bring-up-a-new-read-replica-cluster",content:"From the replica shell, run `refresh_meta` and then `refresh_hfiles` to materialize the active cluster's\ncurrent state on the replica."},{heading:"case-2-routine-sync-after-writes-on-the-active-cluster",content:"Always run `refresh_meta` first, then `refresh_hfiles`. `refresh_hfiles` only refreshes regions that are open\non the replica, so newly discovered regions must be in meta (and assigned) before their HFiles can be picked\nup. `refresh_hfiles` supports three scopes:"},{heading:"case-2-routine-sync-after-writes-on-the-active-cluster",content:"Passing both `TABLE_NAME` and `NAMESPACE` to `refresh_hfiles` is rejected. Both commands return a procedure\nID that can be tracked through the master UI or `Admin.getProcedures()`."},{heading:"case-2-routine-sync-after-writes-on-the-active-cluster",content:"If the replica's block cache holds stale entries for a table that has just been refreshed, evict them with\nthe pre-existing `clear_block_cache 'my_namespace:my_table'` shell command."},{heading:"case-2-routine-sync-after-writes-on-the-active-cluster",content:"`Admin` and `AsyncAdmin` expose the same operations programmatically:"},{heading:"case-3-dynamically-toggle-read-only-mode",content:"`hbase.global.readonly.enabled` can be changed without a restart. Edit `hbase-site.xml` then\ntrigger a configuration refresh (for example, `update_all_config` from the shell). `ConfigurationManager`\nnotifies its observers, which load or unload the read-only coprocessors and call\n`AbstractReadOnlyController.manageActiveClusterIdFile`:"},{heading:"case-3-dynamically-toggle-read-only-mode",content:"**false → true (becoming a replica):** the `active.cluster.suffix.id` file is deleted only if its contents\nmatch this cluster; if another cluster owns the file, it is left in place."},{heading:"case-3-dynamically-toggle-read-only-mode",content:`**true → false (becoming active):** the file is recreated with this cluster's identity, unless it already
exists.`},{heading:"case-3-dynamically-toggle-read-only-mode",content:"In-flight batch operations are not interrupted; write operations submitted *after* the toggle throw\n`WriteAttemptedOnReadOnlyClusterException`. The caller is responsible for handling and (if desired) resubmitting the failed\nmutations."},{heading:"case-4-promote-a-replica-when-the-active-cluster-is-lost",content:"Confirm the original active cluster is fully down."},{heading:"case-4-promote-a-replica-when-the-active-cluster-is-lost",content:"If a stale `active.cluster.suffix.id` from the previous active is still present, remove it manually\n(e.g. `hdfs dfs -rm <hbase.rootdir>/active.cluster.suffix.id`, or the equivalent CLI for your object\nstore). The new active master will refuse to start while a foreign sentinel file is in place."},{heading:"case-4-promote-a-replica-when-the-active-cluster-is-lost",content:"Set `hbase.global.readonly.enabled=false` on the replica and apply the change (dynamic update or\nrestart). The master writes a fresh sentinel file with this cluster's identity."},{heading:"case-5-recover-from-a-blocked-read-only-transition",content:"If you attempt to promote a replica to active (`hbase.global.readonly.enabled=false` + `update_all_config`)\nwhile a different cluster's `active.cluster.suffix.id` file is still present, the transition is blocked. The\nshell returns a `ReadOnlyTransitionException` and the cluster remains in read-only mode — writes continue to be\nrejected with `WriteAttemptedOnReadOnlyClusterException`."},{heading:"case-5-recover-from-a-blocked-read-only-transition",content:"The server ERROR log includes the foreign cluster's ID:"},{heading:"case-5-recover-from-a-blocked-read-only-transition",content:"A cluster whose promotion was blocked is still a replica — the read-only coprocessors remain\nloaded and writes are still rejected — even though its `hbase-site.xml` has\n`hbase.global.readonly.enabled=false`."},{heading:"case-5-recover-from-a-blocked-read-only-transition",content:`To recover, choose one of the following paths depending on whether the existing active cluster is still
running.`},{heading:"case-5-recover-from-a-blocked-read-only-transition",content:"**Path A — the active cluster is still running:**"},{heading:"case-5-recover-from-a-blocked-read-only-transition",content:"On the currently active cluster, set `hbase.global.readonly.enabled=true` in `hbase-site.xml` and run\n`update_all_config`. This converts it to a replica and deletes its `active.cluster.suffix.id` file."},{heading:"case-5-recover-from-a-blocked-read-only-transition",content:"On the cluster you want to promote, re-run `update_all_config`. The transition will now succeed — the\ncluster writes a fresh sentinel file with its own identity and unloads the read-only coprocessors."},{heading:"case-5-recover-from-a-blocked-read-only-transition",content:"**Path B — the active cluster is down or has already been converted to a replica:**"},{heading:"case-5-recover-from-a-blocked-read-only-transition",content:"Confirm the cluster that owns the sentinel file is fully stopped or has already been converted to a replica."},{heading:"case-5-recover-from-a-blocked-read-only-transition",content:"Remove the foreign sentinel file:"},{heading:"case-5-recover-from-a-blocked-read-only-transition",content:"On the cluster you want to promote, re-run `update_all_config`. The transition will now succeed — the\ncluster writes a fresh sentinel file with its own identity and unloads the read-only coprocessors."},{heading:"case-5-recover-from-a-blocked-read-only-transition",content:`**Do not remove the sentinel file while the cluster that wrote it is still running as an active
cluster.** Doing so would allow two clusters to write to the same shared storage simultaneously,
risking data corruption.`},{heading:"read-replica-cluster-new-configs",content:"Config"},{heading:"read-replica-cluster-new-configs",content:"Default"},{heading:"read-replica-cluster-new-configs",content:"Description"},{heading:"read-replica-cluster-new-configs",content:"`hbase.meta.table.suffix`"},{heading:"read-replica-cluster-new-configs",content:'`""`'},{heading:"read-replica-cluster-new-configs",content:"Adds a suffix to the meta table name. `value='test'` produces the table name `hbase:meta_test`."},{heading:"read-replica-cluster-new-configs",content:"`hbase.global.readonly.enabled`"},{heading:"read-replica-cluster-new-configs",content:"`false`"},{heading:"read-replica-cluster-new-configs",content:"Puts the entire cluster into read-only mode."},{heading:"new-commands",content:"Command"},{heading:"new-commands",content:"Usage"},{heading:"new-commands",content:"Description"},{heading:"new-commands",content:"`refresh_hfiles`"},{heading:"new-commands",content:"`refresh_hfiles``refresh_hfiles 'TABLE_NAME' => 'tablename'``refresh_hfiles 'TABLE_NAME' => 'namespace:test_table'``refresh_hfiles 'NAMESPACE' => 'namespace'`"},{heading:"new-commands",content:"Refreshes HFiles from disk. Used to pick up new edits on the read replica."},{heading:"new-commands",content:"`refresh_meta`"},{heading:"new-commands",content:"`refresh_meta`"},{heading:"new-commands",content:"Syncs the meta table with the backing storage. Used to pick up new tables and regions."}],headings:[{id:"read-replica-cluster-background",content:"Background"},{id:"read-replica-cluster-design",content:"Design"},{id:"custom-hbasemeta-per-cluster",content:"Custom `hbase:meta` per cluster"},{id:"global-read-only-mode",content:"Global read-only mode"},{id:"preventing-multiple-active-clusters-activeclustersuffixid",content:"Preventing Multiple Active Clusters (active.cluster.suffix.id)"},{id:"read-replica-cluster-configuration",content:"Configuration"},{id:"read-replica-cluster-operation-and-maintenance",content:"Operation and maintenance"},{id:"case-1-bring-up-a-new-read-replica-cluster",content:"Case 1. Bring up a new read replica cluster"},{id:"case-2-routine-sync-after-writes-on-the-active-cluster",content:"Case 2. Routine sync after writes on the active cluster"},{id:"case-3-dynamically-toggle-read-only-mode",content:"Case 3. Dynamically toggle read-only mode"},{id:"case-4-promote-a-replica-when-the-active-cluster-is-lost",content:"Case 4. Promote a replica when the active cluster is lost"},{id:"case-5-recover-from-a-blocked-read-only-transition",content:"Case 5. Recover from a blocked read-only transition"},{id:"configurations-and-commands",content:"Configurations and Commands"},{id:"read-replica-cluster-new-configs",content:"New configs"},{id:"new-commands",content:"New commands"}]},d=[{depth:2,url:"#read-replica-cluster-background",title:e.jsx(e.Fragment,{children:"Background"})},{depth:2,url:"#read-replica-cluster-design",title:e.jsx(e.Fragment,{children:"Design"})},{depth:3,url:"#custom-hbasemeta-per-cluster",title:e.jsxs(e.Fragment,{children:["Custom ",e.jsx("code",{children:"hbase:meta"})," per cluster"]})},{depth:3,url:"#global-read-only-mode",title:e.jsx(e.Fragment,{children:"Global read-only mode"})},{depth:3,url:"#preventing-multiple-active-clusters-activeclustersuffixid",title:e.jsx(e.Fragment,{children:"Preventing Multiple Active Clusters (active.cluster.suffix.id)"})},{depth:2,url:"#read-replica-cluster-configuration",title:e.jsx(e.Fragment,{children:"Configuration"})},{depth:2,url:"#read-replica-cluster-operation-and-maintenance",title:e.jsx(e.Fragment,{children:"Operation and maintenance"})},{depth:3,url:"#case-1-bring-up-a-new-read-replica-cluster",title:e.jsx(e.Fragment,{children:"Case 1. Bring up a new read replica cluster"})},{depth:3,url:"#case-2-routine-sync-after-writes-on-the-active-cluster",title:e.jsx(e.Fragment,{children:"Case 2. Routine sync after writes on the active cluster"})},{depth:3,url:"#case-3-dynamically-toggle-read-only-mode",title:e.jsx(e.Fragment,{children:"Case 3. Dynamically toggle read-only mode"})},{depth:3,url:"#case-4-promote-a-replica-when-the-active-cluster-is-lost",title:e.jsx(e.Fragment,{children:"Case 4. Promote a replica when the active cluster is lost"})},{depth:3,url:"#case-5-recover-from-a-blocked-read-only-transition",title:e.jsx(e.Fragment,{children:"Case 5. Recover from a blocked read-only transition"})},{depth:2,url:"#configurations-and-commands",title:e.jsx(e.Fragment,{children:"Configurations and Commands"})},{depth:3,url:"#read-replica-cluster-new-configs",title:e.jsx(e.Fragment,{children:"New configs"})},{depth:3,url:"#new-commands",title:e.jsx(e.Fragment,{children:"New commands"})}];function n(i){const s={a:"a",code:"code",em:"em",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...i.components},{Callout:t}=s;return t||a("Callout"),e.jsxs(e.Fragment,{children:[e.jsx(s.h2,{id:"read-replica-cluster-background",children:"Background"}),`
`,e.jsxs(s.p,{children:["A ",e.jsx(s.em,{children:"Read Replica Cluster"}),` is an entire HBase cluster running in global read-only mode against the same shared
storage (`,e.jsx(s.code,{children:"hbase.rootdir"}),`) as an active read-write cluster. Both clusters list the same HFiles in the same
HDFS / cloud-object-store location; no data is copied. Reads can be served from either cluster, letting the
read workload be fanned out across multiple clusters without doubling storage cost.`]}),`
`,e.jsx(s.p,{children:"Typical use cases:"}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsx(s.li,{children:"Fan out heavy scan / analytical workloads off the primary cluster."}),`
`,e.jsx(s.li,{children:"Add cross-availability-zone read capacity backed by a single shared bucket."}),`
`,e.jsx(s.li,{children:"Stand up an isolated cluster for read-mostly experiments without copying data."}),`
`]}),`
`,e.jsx(t,{type:"info",children:e.jsxs(s.p,{children:[e.jsx(s.strong,{children:"Eventual consistency."}),` A replica only sees data once (a) the active cluster has flushed the
data to HFiles in shared storage, and (b) the replica has been told to re-read shared storage via
the `,e.jsx(s.code,{children:"refresh_meta"})," and ",e.jsx(s.code,{children:"refresh_hfiles"}),` commands. MemStore data on the active cluster is invisible
to the replica until flushed.`]})}),`
`,e.jsxs(s.p,{children:["The parent design lives on ",e.jsx(s.a,{href:"https://issues.apache.org/jira/browse/HBASE-29081",children:"HBASE-29081"}),"."]}),`
`,e.jsx(s.h2,{id:"read-replica-cluster-design",children:"Design"}),`
`,e.jsx(s.p,{children:"The feature has three parts."}),`
`,e.jsxs(s.h3,{id:"custom-hbasemeta-per-cluster",children:["Custom ",e.jsx(s.code,{children:"hbase:meta"})," per cluster"]}),`
`,e.jsxs(s.p,{children:["Every cluster sharing a ",e.jsx(s.code,{children:"hbase.rootdir"})," needs its own ",e.jsx(s.code,{children:"hbase:meta"}),` and its own master local region
directory, because region assignments and master-local state are node-scoped and cannot be shared. Other
system tables (`,e.jsx(s.code,{children:"hbase:acl"}),", ",e.jsx(s.code,{children:"hbase:replication"}),") ",e.jsx(s.em,{children:"are"}),` safe to share because their contents are storage-wide
and the replica never writes to them.`]}),`
`,e.jsxs(s.p,{children:["The configuration key ",e.jsx(s.code,{children:"hbase.meta.table.suffix"}),` selects a per-cluster suffix; the meta table becomes
`,e.jsx(s.code,{children:"hbase:meta_<suffix>"})," and the master's local store directory becomes ",e.jsx(s.code,{children:"MasterData_<suffix>"}),`. Each cluster
sharing the same `,e.jsx(s.code,{children:"hbase.rootdir"})," must be configured with a distinct suffix so its ",e.jsx(s.code,{children:"hbase:meta"}),` and
`,e.jsx(s.code,{children:"MasterData"})," directory do not collide with any other cluster's. The suffix must match ",e.jsx(s.code,{children:"[a-zA-Z0-9]+"}),"."]}),`
`,e.jsx(s.h3,{id:"global-read-only-mode",children:"Global read-only mode"}),`
`,e.jsxs(s.p,{children:[e.jsx(s.code,{children:"hbase.global.readonly.enabled=true"}),` puts a cluster into read-only mode. Five coprocessor controllers under
`,e.jsx(s.code,{children:"org.apache.hadoop.hbase.security.access"}),` intercept every user-table mutation path and throw
`,e.jsx(s.code,{children:"WriteAttemptedOnReadOnlyClusterException"})," (a ",e.jsx(s.code,{children:"DoNotRetryIOException"}),`) with the message
`,e.jsx(s.code,{children:"Operation not allowed in Read-Only Mode"}),":"]}),`
`,e.jsxs(s.table,{children:[e.jsx(s.thead,{children:e.jsxs(s.tr,{children:[e.jsx(s.th,{children:"Class"}),e.jsx(s.th,{children:"Coprocessor host"}),e.jsx(s.th,{children:"Blocks"})]})}),e.jsxs(s.tbody,{children:[e.jsxs(s.tr,{children:[e.jsx(s.td,{children:e.jsx(s.code,{children:"MasterReadOnlyController"})}),e.jsx(s.td,{children:"Master"}),e.jsx(s.td,{children:"DDL, snapshots, splits, merges, namespace ops, ACL/quota ops, replication-peer ops"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:e.jsx(s.code,{children:"RegionServerReadOnlyController"})}),e.jsx(s.td,{children:"RegionServer"}),e.jsx(s.td,{children:"WAL roll, replication sink mutations, log replay"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:e.jsx(s.code,{children:"RegionReadOnlyController"})}),e.jsx(s.td,{children:"Region"}),e.jsx(s.td,{children:"put, delete, batchMutate, checkAnd*, append, increment, flush, compaction, WAL append, commit/replay"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:e.jsx(s.code,{children:"BulkLoadReadOnlyController"})}),e.jsx(s.td,{children:"Region"}),e.jsx(s.td,{children:"bulk-load prepare/cleanup"})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:e.jsx(s.code,{children:"EndpointReadOnlyController"})}),e.jsx(s.td,{children:"Region"}),e.jsx(s.td,{children:"all coprocessor endpoint invocations"})]})]})]}),`
`,e.jsxs(s.p,{children:["Operators do not load these classes manually. ",e.jsx(s.code,{children:"CoprocessorConfigurationUtil.syncReadOnlyConfigurations"}),`
adds them to `,e.jsx(s.code,{children:"hbase.coprocessor.master.classes"}),", ",e.jsx(s.code,{children:"hbase.coprocessor.regionserver.classes"}),`, and
`,e.jsx(s.code,{children:"hbase.coprocessor.region.classes"}),` at startup and on every dynamic
`,e.jsx(s.code,{children:"ConfigurationManager.notifyAllObservers"}),` event — so the flag can be flipped at runtime with
`,e.jsx(s.code,{children:"update_all_config"})," (see Case 3)."]}),`
`,e.jsx(s.h3,{id:"preventing-multiple-active-clusters-activeclustersuffixid",children:"Preventing Multiple Active Clusters (active.cluster.suffix.id)"}),`
`,e.jsxs(s.p,{children:["Two clusters writing to the same ",e.jsx(s.code,{children:"hbase.rootdir"}),` would corrupt shared storage. To enforce a single writer, an
active master creates a protobuf-serialized sentinel at `,e.jsx(s.code,{children:"<hbase.rootdir>/active.cluster.suffix.id"}),` recording
its cluster ID and meta suffix. `,e.jsx(s.code,{children:"MasterFileSystem.negotiateActiveClusterSuffixFile"})," runs at master startup:"]}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:["An ",e.jsx(s.strong,{children:"active"})," cluster (",e.jsx(s.code,{children:"hbase.global.readonly.enabled=false"}),`) creates the file if absent, or verifies its
contents match its own identity. If the file belongs to another cluster, startup aborts with an
`,e.jsx(s.code,{children:"IOException"}),"."]}),`
`,e.jsxs(s.li,{children:["A ",e.jsx(s.strong,{children:"replica"})," cluster (",e.jsx(s.code,{children:"hbase.global.readonly.enabled=true"}),`) does not read or write the file; it logs
`,e.jsx(s.code,{children:"[Read-replica feature] Replica cluster is being started in Read Only Mode"})," and continues."]}),`
`]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.code,{children:"AbstractReadOnlyController.manageActiveClusterIdFile"}),` handles the dynamic toggle: switching to read-only
deletes the file if this cluster owns it, and switching back to read-write creates the file if absent.`]}),`
`,e.jsx(s.h2,{id:"read-replica-cluster-configuration",children:"Configuration"}),`
`,e.jsxs(s.p,{children:["On every node of the ",e.jsx(s.strong,{children:"read replica cluster"}),", add the following to ",e.jsx(s.code,{children:"hbase-site.xml"}),":"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">hbase.global.readonly.enabled</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">true</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"description"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    Put this cluster into global read-only mode. All user-table writes, flushes,"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    compactions, splits, and merges are blocked. The five ReadOnly coprocessor"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    controllers are loaded automatically."})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  </"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"description"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">hbase.meta.table.suffix</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"name"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">replica1</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"value"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  <"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"description"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    Optional. If set, the meta table is named hbase:meta_<"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"suffix"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"> and the"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    master's local store directory is MasterData_<"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"suffix"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">. Value must match"})]}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    [a-zA-Z0-9]+. Each cluster sharing the same hbase.rootdir MUST be"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    configured with a distinct suffix so its hbase:meta and MasterData"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    directory do not collide with any other cluster's."})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  </"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"description"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(s.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"property"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]})]})})}),`
`,e.jsxs(s.p,{children:["The ",e.jsx(s.strong,{children:"active cluster"})," uses the same ",e.jsx(s.code,{children:"hbase.rootdir"})," but its own ",e.jsx(s.code,{children:"hbase.meta.table.suffix"}),` (distinct from
every replica's suffix), and leaves `,e.jsx(s.code,{children:"hbase.global.readonly.enabled"})," unset or ",e.jsx(s.code,{children:"false"}),"."]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.code,{children:"hbase.global.readonly.enabled"}),` is a dynamic configuration — a config-change event reloads the read-only
coprocessors without restarting the process. All nodes must agree on the value; operators are responsible for
keeping every `,e.jsx(s.code,{children:"hbase-site.xml"})," in sync before issuing ",e.jsx(s.code,{children:"update_all_config"}),"."]}),`
`,e.jsx(s.h2,{id:"read-replica-cluster-operation-and-maintenance",children:"Operation and maintenance"}),`
`,e.jsx(s.h3,{id:"case-1-bring-up-a-new-read-replica-cluster",children:"Case 1. Bring up a new read replica cluster"}),`
`,e.jsxs(s.ol,{children:[`
`,e.jsxs(s.li,{children:["Provision the replica cluster on hardware that can reach the active cluster's ",e.jsx(s.code,{children:"hbase.rootdir"}),` (typically
the same HDFS or object store).`]}),`
`,e.jsxs(s.li,{children:["Set ",e.jsx(s.code,{children:"hbase.global.readonly.enabled=true"})," in the replica's ",e.jsx(s.code,{children:"hbase-site.xml"}),`. And set up
`,e.jsx(s.code,{children:"hbase.meta.table.suffix"}),", to distinguish the replica cluster's meta table on the shared storage."]}),`
`,e.jsxs(s.li,{children:[`Start the cluster and verify if the Master log shows
`,e.jsx(s.code,{children:"[Read-replica feature] Replica cluster is being started in Read Only Mode"}),"."]}),`
`,e.jsxs(s.li,{children:["From the replica shell, run ",e.jsx(s.code,{children:"refresh_meta"})," and then ",e.jsx(s.code,{children:"refresh_hfiles"}),` to materialize the active cluster's
current state on the replica.`]}),`
`]}),`
`,e.jsx(s.h3,{id:"case-2-routine-sync-after-writes-on-the-active-cluster",children:"Case 2. Routine sync after writes on the active cluster"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M20.156.083c3.033.525 3.893 2.598 3.829 4.77L24 4.822 22.635 22.71 4.89 23.926h.016C3.433 23.864.15 23.729 0 19.139l1.645-3 2.819 6.586.503 1.172 2.805-9.144-.03.007.016-.03 9.255 2.956-1.396-5.431-.99-3.9 8.82-.569-.615-.51L16.5 2.114 20.159.073l-.003.01zM0 19.089zM5.13 5.073c3.561-3.533 8.157-5.621 9.922-3.84 1.762 1.777-.105 6.105-3.673 9.636-3.563 3.532-8.103 5.734-9.864 3.957-1.766-1.777.045-6.217 3.612-9.75l.003-.003z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# On the active cluster"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"hbase"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" flush "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'my_namespace:my_table'"})]})]})})}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M20.156.083c3.033.525 3.893 2.598 3.829 4.77L24 4.822 22.635 22.71 4.89 23.926h.016C3.433 23.864.15 23.729 0 19.139l1.645-3 2.819 6.586.503 1.172 2.805-9.144-.03.007.016-.03 9.255 2.956-1.396-5.431-.99-3.9 8.82-.569-.615-.51L16.5 2.114 20.159.073l-.003.01zM0 19.089zM5.13 5.073c3.561-3.533 8.157-5.621 9.922-3.84 1.762 1.777-.105 6.105-3.673 9.636-3.563 3.532-8.103 5.734-9.864 3.957-1.766-1.777.045-6.217 3.612-9.75l.003-.003z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsx(s.span,{className:"line",children:e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# On the read replica cluster"})}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"hbase"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" refresh_meta"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"hbase"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" refresh_hfiles "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'TABLE_NAME'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'my_namespace:my_table'"})]})]})})}),`
`,e.jsxs(s.p,{children:["Always run ",e.jsx(s.code,{children:"refresh_meta"})," first, then ",e.jsx(s.code,{children:"refresh_hfiles"}),". ",e.jsx(s.code,{children:"refresh_hfiles"}),` only refreshes regions that are open
on the replica, so newly discovered regions must be in meta (and assigned) before their HFiles can be picked
up. `,e.jsx(s.code,{children:"refresh_hfiles"})," supports three scopes:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M20.156.083c3.033.525 3.893 2.598 3.829 4.77L24 4.822 22.635 22.71 4.89 23.926h.016C3.433 23.864.15 23.729 0 19.139l1.645-3 2.819 6.586.503 1.172 2.805-9.144-.03.007.016-.03 9.255 2.956-1.396-5.431-.99-3.9 8.82-.569-.615-.51L16.5 2.114 20.159.073l-.003.01zM0 19.089zM5.13 5.073c3.561-3.533 8.157-5.621 9.922-3.84 1.762 1.777-.105 6.105-3.673 9.636-3.563 3.532-8.103 5.734-9.864 3.957-1.766-1.777.045-6.217 3.612-9.75l.003-.003z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"hbase"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" refresh_hfiles                              "}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"# all user tables"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"hbase"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" refresh_hfiles "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'TABLE_NAME'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" => "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'ns:table'"}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"   # one table"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"hbase"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" refresh_hfiles "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'NAMESPACE'"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  => "}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'ns'"}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"         # one namespace"})]})]})})}),`
`,e.jsxs(s.p,{children:["Passing both ",e.jsx(s.code,{children:"TABLE_NAME"})," and ",e.jsx(s.code,{children:"NAMESPACE"})," to ",e.jsx(s.code,{children:"refresh_hfiles"}),` is rejected. Both commands return a procedure
ID that can be tracked through the master UI or `,e.jsx(s.code,{children:"Admin.getProcedures()"}),"."]}),`
`,e.jsxs(s.p,{children:[`If the replica's block cache holds stale entries for a table that has just been refreshed, evict them with
the pre-existing `,e.jsx(s.code,{children:"clear_block_cache 'my_namespace:my_table'"})," shell command."]}),`
`,e.jsxs(s.p,{children:[e.jsx(s.code,{children:"Admin"})," and ",e.jsx(s.code,{children:"AsyncAdmin"})," expose the same operations programmatically:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"long"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" pid;"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"pid "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" admin."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"refreshMeta"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"pid "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" admin."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"refreshHFiles"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();                              "}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// all user tables"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"pid "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" admin."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"refreshHFiles"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(TableName."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"valueOf"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"ns:table"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")); "}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// one table"})]}),`
`,e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"pid "}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" admin."}),e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"refreshHFiles"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"ns"'}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");                          "}),e.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"// one namespace"})]})]})})}),`
`,e.jsx(s.h3,{id:"case-3-dynamically-toggle-read-only-mode",children:"Case 3. Dynamically toggle read-only mode"}),`
`,e.jsxs(s.p,{children:[e.jsx(s.code,{children:"hbase.global.readonly.enabled"})," can be changed without a restart. Edit ",e.jsx(s.code,{children:"hbase-site.xml"}),` then
trigger a configuration refresh (for example, `,e.jsx(s.code,{children:"update_all_config"})," from the shell). ",e.jsx(s.code,{children:"ConfigurationManager"}),`
notifies its observers, which load or unload the read-only coprocessors and call
`,e.jsx(s.code,{children:"AbstractReadOnlyController.manageActiveClusterIdFile"}),":"]}),`
`,e.jsxs(s.ul,{children:[`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"false → true (becoming a replica):"})," the ",e.jsx(s.code,{children:"active.cluster.suffix.id"}),` file is deleted only if its contents
match this cluster; if another cluster owns the file, it is left in place.`]}),`
`,e.jsxs(s.li,{children:[e.jsx(s.strong,{children:"true → false (becoming active):"}),` the file is recreated with this cluster's identity, unless it already
exists.`]}),`
`]}),`
`,e.jsxs(s.p,{children:["In-flight batch operations are not interrupted; write operations submitted ",e.jsx(s.em,{children:"after"}),` the toggle throw
`,e.jsx(s.code,{children:"WriteAttemptedOnReadOnlyClusterException"}),`. The caller is responsible for handling and (if desired) resubmitting the failed
mutations.`]}),`
`,e.jsx(s.h3,{id:"case-4-promote-a-replica-when-the-active-cluster-is-lost",children:"Case 4. Promote a replica when the active cluster is lost"}),`
`,e.jsxs(s.ol,{children:[`
`,e.jsx(s.li,{children:"Confirm the original active cluster is fully down."}),`
`,e.jsxs(s.li,{children:["If a stale ",e.jsx(s.code,{children:"active.cluster.suffix.id"}),` from the previous active is still present, remove it manually
(e.g. `,e.jsx(s.code,{children:"hdfs dfs -rm <hbase.rootdir>/active.cluster.suffix.id"}),`, or the equivalent CLI for your object
store). The new active master will refuse to start while a foreign sentinel file is in place.`]}),`
`,e.jsxs(s.li,{children:["Set ",e.jsx(s.code,{children:"hbase.global.readonly.enabled=false"}),` on the replica and apply the change (dynamic update or
restart). The master writes a fresh sentinel file with this cluster's identity.`]}),`
`]}),`
`,e.jsx(s.h3,{id:"case-5-recover-from-a-blocked-read-only-transition",children:"Case 5. Recover from a blocked read-only transition"}),`
`,e.jsxs(s.p,{children:["If you attempt to promote a replica to active (",e.jsx(s.code,{children:"hbase.global.readonly.enabled=false"})," + ",e.jsx(s.code,{children:"update_all_config"}),`)
while a different cluster's `,e.jsx(s.code,{children:"active.cluster.suffix.id"}),` file is still present, the transition is blocked. The
shell returns a `,e.jsx(s.code,{children:"ReadOnlyTransitionException"}),` and the cluster remains in read-only mode — writes continue to be
rejected with `,e.jsx(s.code,{children:"WriteAttemptedOnReadOnlyClusterException"}),"."]}),`
`,e.jsx(s.p,{children:"The server ERROR log includes the foreign cluster's ID:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(s.code,{children:[e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"Cannot disable read-only mode. The active.cluster.suffix.id file contains a different"})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"cluster ID (<foreign-id>), which means that cluster is already the active cluster."})}),`
`,e.jsx(s.span,{className:"line",children:e.jsx(s.span,{children:"Reverting hbase.global.readonly.enabled to true."})})]})})}),`
`,e.jsx(t,{type:"info",children:e.jsxs(s.p,{children:[`A cluster whose promotion was blocked is still a replica — the read-only coprocessors remain
loaded and writes are still rejected — even though its `,e.jsx(s.code,{children:"hbase-site.xml"}),` has
`,e.jsx(s.code,{children:"hbase.global.readonly.enabled=false"}),"."]})}),`
`,e.jsx(s.p,{children:`To recover, choose one of the following paths depending on whether the existing active cluster is still
running.`}),`
`,e.jsx(s.p,{children:e.jsx(s.strong,{children:"Path A — the active cluster is still running:"})}),`
`,e.jsxs(s.ol,{children:[`
`,e.jsxs(s.li,{children:["On the currently active cluster, set ",e.jsx(s.code,{children:"hbase.global.readonly.enabled=true"})," in ",e.jsx(s.code,{children:"hbase-site.xml"}),` and run
`,e.jsx(s.code,{children:"update_all_config"}),". This converts it to a replica and deletes its ",e.jsx(s.code,{children:"active.cluster.suffix.id"})," file."]}),`
`,e.jsxs(s.li,{children:["On the cluster you want to promote, re-run ",e.jsx(s.code,{children:"update_all_config"}),`. The transition will now succeed — the
cluster writes a fresh sentinel file with its own identity and unloads the read-only coprocessors.`]}),`
`]}),`
`,e.jsx(s.p,{children:e.jsx(s.strong,{children:"Path B — the active cluster is down or has already been converted to a replica:"})}),`
`,e.jsxs(s.ol,{children:[`
`,e.jsx(s.li,{children:"Confirm the cluster that owns the sentinel file is fully stopped or has already been converted to a replica."}),`
`,e.jsxs(s.li,{children:["Remove the foreign sentinel file:",`
`,e.jsx(e.Fragment,{children:e.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(s.code,{children:e.jsxs(s.span,{className:"line",children:[e.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hdfs"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" dfs"}),e.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -rm"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"hbase.rootdi"}),e.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"r"}),e.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"/active.cluster.suffix.id"})]})})})}),`
`]}),`
`,e.jsxs(s.li,{children:["On the cluster you want to promote, re-run ",e.jsx(s.code,{children:"update_all_config"}),`. The transition will now succeed — the
cluster writes a fresh sentinel file with its own identity and unloads the read-only coprocessors.`]}),`
`]}),`
`,e.jsx(t,{type:"warning",children:e.jsxs(s.p,{children:[e.jsx(s.strong,{children:`Do not remove the sentinel file while the cluster that wrote it is still running as an active
cluster.`}),` Doing so would allow two clusters to write to the same shared storage simultaneously,
risking data corruption.`]})}),`
`,e.jsx(s.h2,{id:"configurations-and-commands",children:"Configurations and Commands"}),`
`,e.jsx(s.h3,{id:"read-replica-cluster-new-configs",children:"New configs"}),`
`,e.jsxs(s.table,{children:[e.jsx(s.thead,{children:e.jsxs(s.tr,{children:[e.jsx(s.th,{children:"Config"}),e.jsx(s.th,{children:"Default"}),e.jsx(s.th,{children:"Description"})]})}),e.jsxs(s.tbody,{children:[e.jsxs(s.tr,{children:[e.jsx(s.td,{children:e.jsx(s.code,{children:"hbase.meta.table.suffix"})}),e.jsx(s.td,{children:e.jsx(s.code,{children:'""'})}),e.jsxs(s.td,{children:["Adds a suffix to the meta table name. ",e.jsx(s.code,{children:"value='test'"})," produces the table name ",e.jsx(s.code,{children:"hbase:meta_test"}),"."]})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:e.jsx(s.code,{children:"hbase.global.readonly.enabled"})}),e.jsx(s.td,{children:e.jsx(s.code,{children:"false"})}),e.jsx(s.td,{children:"Puts the entire cluster into read-only mode."})]})]})]}),`
`,e.jsx(s.h3,{id:"new-commands",children:"New commands"}),`
`,e.jsxs(s.table,{children:[e.jsx(s.thead,{children:e.jsxs(s.tr,{children:[e.jsx(s.th,{children:"Command"}),e.jsx(s.th,{children:"Usage"}),e.jsx(s.th,{children:"Description"})]})}),e.jsxs(s.tbody,{children:[e.jsxs(s.tr,{children:[e.jsx(s.td,{children:e.jsx(s.code,{children:"refresh_hfiles"})}),e.jsxs(s.td,{children:[e.jsx(s.code,{children:"refresh_hfiles"}),e.jsx("br",{}),e.jsx(s.code,{children:"refresh_hfiles 'TABLE_NAME' => 'tablename'"}),e.jsx("br",{}),e.jsx(s.code,{children:"refresh_hfiles 'TABLE_NAME' => 'namespace:test_table'"}),e.jsx("br",{}),e.jsx(s.code,{children:"refresh_hfiles 'NAMESPACE' => 'namespace'"})]}),e.jsx(s.td,{children:"Refreshes HFiles from disk. Used to pick up new edits on the read replica."})]}),e.jsxs(s.tr,{children:[e.jsx(s.td,{children:e.jsx(s.code,{children:"refresh_meta"})}),e.jsx(s.td,{children:e.jsx(s.code,{children:"refresh_meta"})}),e.jsx(s.td,{children:"Syncs the meta table with the backing storage. Used to pick up new tables and regions."})]})]})]})]})}function u(i={}){const{wrapper:s}=i.components||{};return s?e.jsx(s,{...i,children:e.jsx(n,{...i})}):n(i)}function a(i,s){throw new Error("Expected component `"+i+"` to be defined: you likely forgot to import, pass, or provide it.")}export{l as _markdown,u as default,c as extractedReferences,o as frontmatter,h as structuredData,d as toc};
