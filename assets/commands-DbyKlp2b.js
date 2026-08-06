import{j as e}from"./components-BCHf_v1I.js";let r=`This covers the command-line utilities that administrators would run to create, restore, and merge backups. Tools to
inspect details on specific backup sessions is covered in the next section, [Administration of Backup Images](/docs/backup-restore/administration).

Run the command \`hbase backup help <command>\` to access the online help that provides basic information about a command
and its options. The below information is captured in this help message for each command.

### Creating a Backup Image

<Callout type="info">
  For HBase clusters also using Apache Phoenix: include the SQL system catalog tables in the backup.
  In the event that you need to restore the HBase backup, access to the system catalog tables enable
  you to resume Phoenix interoperability with the restored data.
</Callout>

The first step in running the backup and restore utilities is to perform a full backup and to store the data in a separate image
from the source. At a minimum, you must do this to get a baseline before you can rely on incremental backups.

Run the following command as HBase superuser:

\`\`\`bash
hbase backup create <type> <backup_path>
\`\`\`

After the command finishes running, the console prints a SUCCESS or FAILURE status message. The SUCCESS message includes a *backup* ID.
The backup ID is the Unix time (also known as Epoch time) that the HBase master received the backup request from the client.

<Callout type="info">
  Record the backup ID that appears at the end of a successful backup. In case the source cluster
  fails and you need to recover the dataset with a restore operation, having the backup ID readily
  available can save time.
</Callout>

#### Positional Command-Line Arguments

***type***\\
The type of backup to execute: *full* or *incremental*. As a reminder, an *incremental* backup requires a *full* backup to
already exist.

***backup\\_path***\\
The *backup\\_path* argument specifies the full filesystem URI of where to store the backup image. Valid prefixes are
*hdfs:*, *webhdfs:*, *s3a:* or other compatible Hadoop File System implementations.

#### Named Command-Line Arguments

***-t \\<table\\_name\\[,table\\_name]>***\\
A comma-separated list of tables to back up. If no tables are specified, all tables are backed up. No regular-expression or
wildcard support is present; all table names must be explicitly listed. See [Backup Sets](/docs/backup-restore/commands#using-backup-sets) for more
information about peforming operations on collections of tables. Mutually exclusive with the *-s* option; one of these
named options are required.

***-s \\<backup\\_set\\_name>***\\
Identify tables to backup based on a backup set. See [Using Backup Sets](/docs/backup-restore/commands#using-backup-sets) for the purpose and usage
of backup sets. Mutually exclusive with the *-t* option.

***-w \\<number\\_workers>***\\
(Optional) Specifies the number of parallel workers to copy data to backup destination. Backups are currently executed by MapReduce jobs
so this value corresponds to the number of Mappers that will be spawned by the job.

***-b \\<bandwidth\\_per\\_worker>***\\
(Optional) Specifies the bandwidth of each worker in MB per second.

***-d***\\
(Optional) Enables "DEBUG" mode which prints additional logging about the backup creation.

***-i***\\
(Optional) Ignore checksum verify between source snapshot and exported snapshot. Especially when the source and target file system types
are different, we should use -i option to skip checksum-checks.

***-q \\<name>***\\
(Optional) Allows specification of the name of a YARN queue which the MapReduce job to create the backup should be executed in. This option
is useful to prevent backup tasks from stealing resources away from other MapReduce jobs of high importance.

#### Example usage

\`\`\`bash
$ hbase backup create full hdfs://host5:9000/data/backup -t SALES2,SALES3 -w 3
\`\`\`

This command creates a full backup image of two tables, SALES2 and SALES3, in the HDFS instance who NameNode is host5:9000
in the path */data/backup*. The *-w* option specifies that no more than three parallel works complete the operation.

### Restoring a Backup Image

Run the following command as an HBase superuser. You can only restore a backup on a running HBase cluster because the data must be
redistributed the RegionServers for the operation to complete successfully.

\`\`\`bash
hbase restore <backup_path> <backup_id>
\`\`\`

#### Positional Command-Line Arguments

***backup\\_path***\\
The *backup\\_path* argument specifies the full filesystem URI of where to store the backup image. Valid prefixes are
*hdfs:*, *webhdfs:*, *s3a:* or other compatible Hadoop File System implementations.

***backup\\_id***\\
The backup ID that uniquely identifies the backup image to be restored.

#### Named Command-Line Arguments

***-t \\<table\\_name\\[,table\\_name]>***\\
A comma-separated list of tables to restore. See [Backup Sets](/docs/backup-restore/commands#using-backup-sets) for more
information about peforming operations on collections of tables. Mutually exclusive with the *-s* option; one of these
named options are required.

***-s \\<backup\\_set\\_name>***\\
Identify tables to backup based on a backup set. See [Using Backup Sets](/docs/backup-restore/commands#using-backup-sets) for the purpose and usage
of backup sets. Mutually exclusive with the *-t* option.

***-q \\<name>***\\
(Optional) Allows specification of the name of a YARN queue which the MapReduce job to create the backup should be executed in. This option
is useful to prevent backup tasks from stealing resources away from other MapReduce jobs of high importance.

***-c***\\
(Optional) Perform a dry-run of the restore. The actions are checked, but not executed.

***-m \\<target\\_tables>***\\
(Optional) A comma-separated list of tables to restore into. If this option is not provided, the original table name is used. When
this option is provided, there must be an equal number of entries provided in the \`-t\` option.

***-o***\\
(Optional) Overwrites the target table for the restore if the table already exists.

#### Example of Usage

\`\`\`bash
hbase restore /tmp/backup_incremental backupId_1467823988425 -t mytable1,mytable2
\`\`\`

This command restores two tables of an incremental backup image. In this example:
• \`/tmp/backup_incremental\` is the path to the directory containing the backup image.
• \`backupId_1467823988425\` is the backup ID.
• \`mytable1\` and \`mytable2\` are the names of tables in the backup image to be restored.

<Callout type="info">
  If the namespace of a table being restored does not exist in the target environment, it will be
  automatically created during the restore operation.
  [HBASE-25707](https://issues.apache.org/jira/browse/HBASE-25707)
</Callout>

### Merging Incremental Backup Images

This command can be used to merge two or more incremental backup images into a single incremental
backup image. This can be used to consolidate multiple, small incremental backup images into a single
larger incremental backup image. This command could be used to merge hourly incremental backups
into a daily incremental backup image, or daily incremental backups into a weekly incremental backup.

\`\`\`bash
$ hbase backup merge <backup_ids>
\`\`\`

#### Positional Command-Line Arguments

***backup\\_ids***\\
A comma-separated list of incremental backup image IDs that are to be combined into a single image.

#### Named Command-Line Arguments

None.

#### Example usage

\`\`\`bash
$ hbase backup merge backupId_1467823988425,backupId_1467827588425
\`\`\`

### Using Backup Sets

Backup sets can ease the administration of HBase data backups and restores by reducing the amount of repetitive input
of table names. You can group tables into a named backup set with the \`hbase backup set add\` command. You can then use
the \`-set\` option to invoke the name of a backup set in the \`hbase backup create\` or \`hbase restore\` rather than list
individually every table in the group. You can have multiple backup sets.

<Callout type="info">
  Note the differentiation between the \`hbase backup set add\` command and the *-set* option. The
  \`hbase backup set add\` command must be run before using the \`-set\` option in a different command
  because backup sets must be named and defined before using backup sets as a shortcut.
</Callout>

If you run the \`hbase backup set add\` command and specify a backup set name that does not yet exist on your system, a new set
is created. If you run the command with the name of an existing backup set name, then the tables that you specify are added
to the set.

In this command, the backup set name is case-sensitive.

<Callout type="info">
  The metadata of backup sets are stored within HBase. If you do not have access to the original
  HBase cluster with the backup set metadata, then you must specify individual table names to
  restore the data.
</Callout>

To create a backup set, run the following command as the HBase superuser:

\`\`\`bash
$ hbase backup set <subcommand> <backup_set_name> <tables>
\`\`\`

#### Backup Set Subcommands

The following list details subcommands of the hbase backup set command.

<Callout type="info">
  You must enter one (and no more than one) of the following subcommands after hbase backup set to
  complete an operation. Also, the backup set name is case-sensitive in the command-line utility.
</Callout>

***add***\\
Adds table\\[s] to a backup set. Specify a *backup\\_set\\_name* value after this argument to create a backup set.

***remove***\\
Removes tables from the set. Specify the tables to remove in the tables argument.

***list***\\
Lists all backup sets.

***describe***\\
Displays a description of a backup set. The information includes whether the set has full
or incremental backups, start and end times of the backups, and a list of the tables in the set. This subcommand must precede
a valid value for the *backup\\_set\\_name* value.

***delete***\\
Deletes a backup set. Enter the value for the *backup\\_set\\_name* option directly after the \`hbase backup set delete\` command.

#### Positional Command-Line Arguments

***backup\\_set\\_name***\\
Use to assign or invoke a backup set name. The backup set name must contain only printable characters and cannot have any spaces.

***tables***\\
List of tables (or a single table) to include in the backup set. Enter the table names as a comma-separated list. If no tables
are specified, all tables are included in the set.

<Callout type="info">
  Maintain a log or other record of the case-sensitive backup set names and the corresponding tables
  in each set on a separate or remote cluster, backup strategy. This information can help you in
  case of failure on the primary cluster.
</Callout>

#### Example of Usage

\`\`\`bash
$ hbase backup set add Q1Data TEAM3,TEAM_4
\`\`\`

Depending on the environment, this command results in *one* of the following actions:

* If the \`Q1Data\` backup set does not exist, a backup set containing tables \`TEAM_3\` and \`TEAM_4\` is created.
* If the \`Q1Data\` backup set exists already, the tables \`TEAM_3\` and \`TEAM_4\` are added to the \`Q1Data\` backup set.
`,c={title:"Backup and Restore commands",description:"Command-line utilities for creating, restoring, and merging HBase backups including full and incremental backup operations."},l=[{href:"/docs/backup-restore/administration"},{href:"/docs/backup-restore/commands#using-backup-sets"},{href:"/docs/backup-restore/commands#using-backup-sets"},{href:"/docs/backup-restore/commands#using-backup-sets"},{href:"/docs/backup-restore/commands#using-backup-sets"},{href:"https://issues.apache.org/jira/browse/HBASE-25707"}],h={contents:[{heading:void 0,content:`This covers the command-line utilities that administrators would run to create, restore, and merge backups. Tools to
inspect details on specific backup sessions is covered in the next section, Administration of Backup Images.`},{heading:void 0,content:"Run the command `hbase backup help <command>` to access the online help that provides basic information about a command\nand its options. The below information is captured in this help message for each command."},{heading:"creating-a-backup-image",content:`For HBase clusters also using Apache Phoenix: include the SQL system catalog tables in the backup.
In the event that you need to restore the HBase backup, access to the system catalog tables enable
you to resume Phoenix interoperability with the restored data.`},{heading:"creating-a-backup-image",content:`The first step in running the backup and restore utilities is to perform a full backup and to store the data in a separate image
from the source. At a minimum, you must do this to get a baseline before you can rely on incremental backups.`},{heading:"creating-a-backup-image",content:"Run the following command as HBase superuser:"},{heading:"creating-a-backup-image",content:`After the command finishes running, the console prints a SUCCESS or FAILURE status message. The SUCCESS message includes a *backup* ID.
The backup ID is the Unix time (also known as Epoch time) that the HBase master received the backup request from the client.`},{heading:"creating-a-backup-image",content:`Record the backup ID that appears at the end of a successful backup. In case the source cluster
fails and you need to recover the dataset with a restore operation, having the backup ID readily
available can save time.`},{heading:"backup-restore-commands-creating-a-backup-image-positional-command-line-arguments",content:`***type***\\
The type of backup to execute: *full* or *incremental*. As a reminder, an *incremental* backup requires a *full* backup to
already exist.`},{heading:"backup-restore-commands-creating-a-backup-image-positional-command-line-arguments",content:`***backup\\_path***\\
The *backup\\_path* argument specifies the full filesystem URI of where to store the backup image. Valid prefixes are
&#x2A;hdfs:*, &#x2A;webhdfs:*, &#x2A;s3a:* or other compatible Hadoop File System implementations.`},{heading:"backup-restore-commands-creating-a-backup-image-named-command-line-arguments",content:`***-t \\<table\\_name\\[,table\\_name]>***\\
A comma-separated list of tables to back up. If no tables are specified, all tables are backed up. No regular-expression or
wildcard support is present; all table names must be explicitly listed. See Backup Set&#x73; for more
information about peforming operations on collections of tables. Mutually exclusive with the *-s* option; one of these
named options are required.`},{heading:"backup-restore-commands-creating-a-backup-image-named-command-line-arguments",content:`***-s \\<backup\\_set\\_name>***\\
Identify tables to backup based on a backup set. See Using Backup Set&#x73; for the purpose and usage
of backup sets. Mutually exclusive with the *-t* option.`},{heading:"backup-restore-commands-creating-a-backup-image-named-command-line-arguments",content:`***-w \\<number\\_workers>***\\
(Optional) Specifies the number of parallel workers to copy data to backup destination. Backups are currently executed by MapReduce jobs
so this value corresponds to the number of Mappers that will be spawned by the job.`},{heading:"backup-restore-commands-creating-a-backup-image-named-command-line-arguments",content:`***-b \\<bandwidth\\_per\\_worker>***\\
(Optional) Specifies the bandwidth of each worker in MB per second.`},{heading:"backup-restore-commands-creating-a-backup-image-named-command-line-arguments",content:`***-d***\\
(Optional) Enables "DEBUG" mode which prints additional logging about the backup creation.`},{heading:"backup-restore-commands-creating-a-backup-image-named-command-line-arguments",content:`***-i***\\
(Optional) Ignore checksum verify between source snapshot and exported snapshot. Especially when the source and target file system types
are different, we should use -i option to skip checksum-checks.`},{heading:"backup-restore-commands-creating-a-backup-image-named-command-line-arguments",content:`***-q \\<name>***\\
(Optional) Allows specification of the name of a YARN queue which the MapReduce job to create the backup should be executed in. This option
is useful to prevent backup tasks from stealing resources away from other MapReduce jobs of high importance.`},{heading:"backup-restore-commands-creating-a-backup-image-example-usage",content:`This command creates a full backup image of two tables, SALES2 and SALES3, in the HDFS instance who NameNode is host5:9000
in the path */data/backup&#x2A;. The *-w* option specifies that no more than three parallel works complete the operation.`},{heading:"restoring-a-backup-image",content:`Run the following command as an HBase superuser. You can only restore a backup on a running HBase cluster because the data must be
redistributed the RegionServers for the operation to complete successfully.`},{heading:"backup-restore-commands-restoring-a-backup-image-positional-command-line-arguments",content:`***backup\\_path***\\
The *backup\\_path* argument specifies the full filesystem URI of where to store the backup image. Valid prefixes are
&#x2A;hdfs:*, &#x2A;webhdfs:*, &#x2A;s3a:* or other compatible Hadoop File System implementations.`},{heading:"backup-restore-commands-restoring-a-backup-image-positional-command-line-arguments",content:`***backup\\_id***\\
The backup ID that uniquely identifies the backup image to be restored.`},{heading:"backup-restore-commands-restoring-a-backup-image-named-command-line-arguments",content:`***-t \\<table\\_name\\[,table\\_name]>***\\
A comma-separated list of tables to restore. See Backup Set&#x73; for more
information about peforming operations on collections of tables. Mutually exclusive with the *-s* option; one of these
named options are required.`},{heading:"backup-restore-commands-restoring-a-backup-image-named-command-line-arguments",content:`***-s \\<backup\\_set\\_name>***\\
Identify tables to backup based on a backup set. See Using Backup Set&#x73; for the purpose and usage
of backup sets. Mutually exclusive with the *-t* option.`},{heading:"backup-restore-commands-restoring-a-backup-image-named-command-line-arguments",content:`***-q \\<name>***\\
(Optional) Allows specification of the name of a YARN queue which the MapReduce job to create the backup should be executed in. This option
is useful to prevent backup tasks from stealing resources away from other MapReduce jobs of high importance.`},{heading:"backup-restore-commands-restoring-a-backup-image-named-command-line-arguments",content:`***-c***\\
(Optional) Perform a dry-run of the restore. The actions are checked, but not executed.`},{heading:"backup-restore-commands-restoring-a-backup-image-named-command-line-arguments",content:"***-m \\<target\\_tables>***\\\n(Optional) A comma-separated list of tables to restore into. If this option is not provided, the original table name is used. When\nthis option is provided, there must be an equal number of entries provided in the `-t` option."},{heading:"backup-restore-commands-restoring-a-backup-image-named-command-line-arguments",content:`***-o***\\
(Optional) Overwrites the target table for the restore if the table already exists.`},{heading:"example-of-usage",content:"This command restores two tables of an incremental backup image. In this example:\n• `/tmp/backup_incremental` is the path to the directory containing the backup image.\n• `backupId_1467823988425` is the backup ID.\n• `mytable1` and `mytable2` are the names of tables in the backup image to be restored."},{heading:"example-of-usage",content:`If the namespace of a table being restored does not exist in the target environment, it will be
automatically created during the restore operation.
HBASE-25707`},{heading:"merging-incremental-backup-images",content:`This command can be used to merge two or more incremental backup images into a single incremental
backup image. This can be used to consolidate multiple, small incremental backup images into a single
larger incremental backup image. This command could be used to merge hourly incremental backups
into a daily incremental backup image, or daily incremental backups into a weekly incremental backup.`},{heading:"backup-restore-commands-merging-incremental-backup-images-positional-command-line-arguments",content:`***backup\\_ids***\\
A comma-separated list of incremental backup image IDs that are to be combined into a single image.`},{heading:"backup-restore-commands-merging-incremental-backup-images-named-command-line-arguments",content:"None."},{heading:"using-backup-sets",content:"Backup sets can ease the administration of HBase data backups and restores by reducing the amount of repetitive input\nof table names. You can group tables into a named backup set with the `hbase backup set add` command. You can then use\nthe `-set` option to invoke the name of a backup set in the `hbase backup create` or `hbase restore` rather than list\nindividually every table in the group. You can have multiple backup sets."},{heading:"using-backup-sets",content:"Note the differentiation between the `hbase backup set add&#x60; command and the *-set* option. The\n`hbase backup set add` command must be run before using the `-set` option in a different command\nbecause backup sets must be named and defined before using backup sets as a shortcut."},{heading:"using-backup-sets",content:"If you run the `hbase backup set add` command and specify a backup set name that does not yet exist on your system, a new set\nis created. If you run the command with the name of an existing backup set name, then the tables that you specify are added\nto the set."},{heading:"using-backup-sets",content:"In this command, the backup set name is case-sensitive."},{heading:"using-backup-sets",content:`The metadata of backup sets are stored within HBase. If you do not have access to the original
HBase cluster with the backup set metadata, then you must specify individual table names to
restore the data.`},{heading:"using-backup-sets",content:"To create a backup set, run the following command as the HBase superuser:"},{heading:"backup-set-subcommands",content:"The following list details subcommands of the hbase backup set command."},{heading:"backup-set-subcommands",content:`You must enter one (and no more than one) of the following subcommands after hbase backup set to
complete an operation. Also, the backup set name is case-sensitive in the command-line utility.`},{heading:"backup-set-subcommands",content:`***add***\\
Adds table\\[s] to a backup set. Specify a *backup\\_set\\_name* value after this argument to create a backup set.`},{heading:"backup-set-subcommands",content:`***remove***\\
Removes tables from the set. Specify the tables to remove in the tables argument.`},{heading:"backup-set-subcommands",content:`***list***\\
Lists all backup sets.`},{heading:"backup-set-subcommands",content:`***describe***\\
Displays a description of a backup set. The information includes whether the set has full
or incremental backups, start and end times of the backups, and a list of the tables in the set. This subcommand must precede
a valid value for the *backup\\_set\\_name* value.`},{heading:"backup-set-subcommands",content:"***delete***\\\nDeletes a backup set. Enter the value for the *backup\\_set\\_name* option directly after the `hbase backup set delete` command."},{heading:"backup-restore-commands-using-backup-sets-positional-command-line-arguments",content:`***backup\\_set\\_name***\\
Use to assign or invoke a backup set name. The backup set name must contain only printable characters and cannot have any spaces.`},{heading:"backup-restore-commands-using-backup-sets-positional-command-line-arguments",content:`***tables***\\
List of tables (or a single table) to include in the backup set. Enter the table names as a comma-separated list. If no tables
are specified, all tables are included in the set.`},{heading:"backup-restore-commands-using-backup-sets-positional-command-line-arguments",content:`Maintain a log or other record of the case-sensitive backup set names and the corresponding tables
in each set on a separate or remote cluster, backup strategy. This information can help you in
case of failure on the primary cluster.`},{heading:"example-of-usage-1",content:"Depending on the environment, this command results in *one* of the following actions:"},{heading:"example-of-usage-1",content:"If the `Q1Data` backup set does not exist, a backup set containing tables `TEAM_3` and `TEAM_4` is created."},{heading:"example-of-usage-1",content:"If the `Q1Data` backup set exists already, the tables `TEAM_3` and `TEAM_4` are added to the `Q1Data` backup set."}],headings:[{id:"creating-a-backup-image",content:"Creating a Backup Image"},{id:"backup-restore-commands-creating-a-backup-image-positional-command-line-arguments",content:"Positional Command-Line Arguments"},{id:"backup-restore-commands-creating-a-backup-image-named-command-line-arguments",content:"Named Command-Line Arguments"},{id:"backup-restore-commands-creating-a-backup-image-example-usage",content:"Example usage"},{id:"restoring-a-backup-image",content:"Restoring a Backup Image"},{id:"backup-restore-commands-restoring-a-backup-image-positional-command-line-arguments",content:"Positional Command-Line Arguments"},{id:"backup-restore-commands-restoring-a-backup-image-named-command-line-arguments",content:"Named Command-Line Arguments"},{id:"example-of-usage",content:"Example of Usage"},{id:"merging-incremental-backup-images",content:"Merging Incremental Backup Images"},{id:"backup-restore-commands-merging-incremental-backup-images-positional-command-line-arguments",content:"Positional Command-Line Arguments"},{id:"backup-restore-commands-merging-incremental-backup-images-named-command-line-arguments",content:"Named Command-Line Arguments"},{id:"backup-restore-commands-merging-incremental-backup-images-example-usage",content:"Example usage"},{id:"using-backup-sets",content:"Using Backup Sets"},{id:"backup-set-subcommands",content:"Backup Set Subcommands"},{id:"backup-restore-commands-using-backup-sets-positional-command-line-arguments",content:"Positional Command-Line Arguments"},{id:"example-of-usage-1",content:"Example of Usage"}]},d=[{depth:3,url:"#creating-a-backup-image",title:e.jsx(e.Fragment,{children:"Creating a Backup Image"})},{depth:4,url:"#backup-restore-commands-creating-a-backup-image-positional-command-line-arguments",title:e.jsx(e.Fragment,{children:"Positional Command-Line Arguments"})},{depth:4,url:"#backup-restore-commands-creating-a-backup-image-named-command-line-arguments",title:e.jsx(e.Fragment,{children:"Named Command-Line Arguments"})},{depth:4,url:"#backup-restore-commands-creating-a-backup-image-example-usage",title:e.jsx(e.Fragment,{children:"Example usage"})},{depth:3,url:"#restoring-a-backup-image",title:e.jsx(e.Fragment,{children:"Restoring a Backup Image"})},{depth:4,url:"#backup-restore-commands-restoring-a-backup-image-positional-command-line-arguments",title:e.jsx(e.Fragment,{children:"Positional Command-Line Arguments"})},{depth:4,url:"#backup-restore-commands-restoring-a-backup-image-named-command-line-arguments",title:e.jsx(e.Fragment,{children:"Named Command-Line Arguments"})},{depth:4,url:"#example-of-usage",title:e.jsx(e.Fragment,{children:"Example of Usage"})},{depth:3,url:"#merging-incremental-backup-images",title:e.jsx(e.Fragment,{children:"Merging Incremental Backup Images"})},{depth:4,url:"#backup-restore-commands-merging-incremental-backup-images-positional-command-line-arguments",title:e.jsx(e.Fragment,{children:"Positional Command-Line Arguments"})},{depth:4,url:"#backup-restore-commands-merging-incremental-backup-images-named-command-line-arguments",title:e.jsx(e.Fragment,{children:"Named Command-Line Arguments"})},{depth:4,url:"#backup-restore-commands-merging-incremental-backup-images-example-usage",title:e.jsx(e.Fragment,{children:"Example usage"})},{depth:3,url:"#using-backup-sets",title:e.jsx(e.Fragment,{children:"Using Backup Sets"})},{depth:4,url:"#backup-set-subcommands",title:e.jsx(e.Fragment,{children:"Backup Set Subcommands"})},{depth:4,url:"#backup-restore-commands-using-backup-sets-positional-command-line-arguments",title:e.jsx(e.Fragment,{children:"Positional Command-Line Arguments"})},{depth:4,url:"#example-of-usage-1",title:e.jsx(e.Fragment,{children:"Example of Usage"})}];function s(n){const a={a:"a",br:"br",code:"code",em:"em",h3:"h3",h4:"h4",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...n.components},{Callout:t}=a;return t||i("Callout"),e.jsxs(e.Fragment,{children:[e.jsxs(a.p,{children:[`This covers the command-line utilities that administrators would run to create, restore, and merge backups. Tools to
inspect details on specific backup sessions is covered in the next section, `,e.jsx(a.a,{href:"/docs/backup-restore/administration",children:"Administration of Backup Images"}),"."]}),`
`,e.jsxs(a.p,{children:["Run the command ",e.jsx(a.code,{children:"hbase backup help <command>"}),` to access the online help that provides basic information about a command
and its options. The below information is captured in this help message for each command.`]}),`
`,e.jsx(a.h3,{id:"creating-a-backup-image",children:"Creating a Backup Image"}),`
`,e.jsx(t,{type:"info",children:e.jsx(a.p,{children:`For HBase clusters also using Apache Phoenix: include the SQL system catalog tables in the backup.
In the event that you need to restore the HBase backup, access to the system catalog tables enable
you to resume Phoenix interoperability with the restored data.`})}),`
`,e.jsx(a.p,{children:`The first step in running the backup and restore utilities is to perform a full backup and to store the data in a separate image
from the source. At a minimum, you must do this to get a baseline before you can rely on incremental backups.`}),`
`,e.jsx(a.p,{children:"Run the following command as HBase superuser:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(a.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(a.code,{children:e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hbase"}),e.jsx(a.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" backup"}),e.jsx(a.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" create"}),e.jsx(a.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <"}),e.jsx(a.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"typ"}),e.jsx(a.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"e"}),e.jsx(a.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(a.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <"}),e.jsx(a.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"backup_pat"}),e.jsx(a.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"h"}),e.jsx(a.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"})]})})})}),`
`,e.jsxs(a.p,{children:["After the command finishes running, the console prints a SUCCESS or FAILURE status message. The SUCCESS message includes a ",e.jsx(a.em,{children:"backup"}),` ID.
The backup ID is the Unix time (also known as Epoch time) that the HBase master received the backup request from the client.`]}),`
`,e.jsx(t,{type:"info",children:e.jsx(a.p,{children:`Record the backup ID that appears at the end of a successful backup. In case the source cluster
fails and you need to recover the dataset with a restore operation, having the backup ID readily
available can save time.`})}),`
`,e.jsx(a.h4,{id:"backup-restore-commands-creating-a-backup-image-positional-command-line-arguments",children:"Positional Command-Line Arguments"}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:e.jsx(a.em,{children:"type"})}),e.jsx(a.br,{}),`
`,"The type of backup to execute: ",e.jsx(a.em,{children:"full"})," or ",e.jsx(a.em,{children:"incremental"}),". As a reminder, an ",e.jsx(a.em,{children:"incremental"})," backup requires a ",e.jsx(a.em,{children:"full"}),` backup to
already exist.`]}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:e.jsx(a.em,{children:"backup_path"})}),e.jsx(a.br,{}),`
`,"The ",e.jsx(a.em,{children:"backup_path"}),` argument specifies the full filesystem URI of where to store the backup image. Valid prefixes are
`,e.jsx(a.em,{children:"hdfs:"}),", ",e.jsx(a.em,{children:"webhdfs:"}),", ",e.jsx(a.em,{children:"s3a:"})," or other compatible Hadoop File System implementations."]}),`
`,e.jsx(a.h4,{id:"backup-restore-commands-creating-a-backup-image-named-command-line-arguments",children:"Named Command-Line Arguments"}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:e.jsx(a.em,{children:"-t <table_name[,table_name]>"})}),e.jsx(a.br,{}),`
`,`A comma-separated list of tables to back up. If no tables are specified, all tables are backed up. No regular-expression or
wildcard support is present; all table names must be explicitly listed. See `,e.jsx(a.a,{href:"/docs/backup-restore/commands#using-backup-sets",children:"Backup Sets"}),` for more
information about peforming operations on collections of tables. Mutually exclusive with the `,e.jsx(a.em,{children:"-s"}),` option; one of these
named options are required.`]}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:e.jsx(a.em,{children:"-s <backup_set_name>"})}),e.jsx(a.br,{}),`
`,"Identify tables to backup based on a backup set. See ",e.jsx(a.a,{href:"/docs/backup-restore/commands#using-backup-sets",children:"Using Backup Sets"}),` for the purpose and usage
of backup sets. Mutually exclusive with the `,e.jsx(a.em,{children:"-t"})," option."]}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:e.jsx(a.em,{children:"-w <number_workers>"})}),e.jsx(a.br,{}),`
`,`(Optional) Specifies the number of parallel workers to copy data to backup destination. Backups are currently executed by MapReduce jobs
so this value corresponds to the number of Mappers that will be spawned by the job.`]}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:e.jsx(a.em,{children:"-b <bandwidth_per_worker>"})}),e.jsx(a.br,{}),`
`,"(Optional) Specifies the bandwidth of each worker in MB per second."]}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:e.jsx(a.em,{children:"-d"})}),e.jsx(a.br,{}),`
`,'(Optional) Enables "DEBUG" mode which prints additional logging about the backup creation.']}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:e.jsx(a.em,{children:"-i"})}),e.jsx(a.br,{}),`
`,`(Optional) Ignore checksum verify between source snapshot and exported snapshot. Especially when the source and target file system types
are different, we should use -i option to skip checksum-checks.`]}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:e.jsx(a.em,{children:"-q <name>"})}),e.jsx(a.br,{}),`
`,`(Optional) Allows specification of the name of a YARN queue which the MapReduce job to create the backup should be executed in. This option
is useful to prevent backup tasks from stealing resources away from other MapReduce jobs of high importance.`]}),`
`,e.jsx(a.h4,{id:"backup-restore-commands-creating-a-backup-image-example-usage",children:"Example usage"}),`
`,e.jsx(e.Fragment,{children:e.jsx(a.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(a.code,{children:e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(a.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" hbase"}),e.jsx(a.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" backup"}),e.jsx(a.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" create"}),e.jsx(a.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" full"}),e.jsx(a.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" hdfs://host5:9000/data/backup"}),e.jsx(a.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -t"}),e.jsx(a.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" SALES2,SALES3"}),e.jsx(a.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -w"}),e.jsx(a.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 3"})]})})})}),`
`,e.jsxs(a.p,{children:[`This command creates a full backup image of two tables, SALES2 and SALES3, in the HDFS instance who NameNode is host5:9000
in the path `,e.jsx(a.em,{children:"/data/backup"}),". The ",e.jsx(a.em,{children:"-w"})," option specifies that no more than three parallel works complete the operation."]}),`
`,e.jsx(a.h3,{id:"restoring-a-backup-image",children:"Restoring a Backup Image"}),`
`,e.jsx(a.p,{children:`Run the following command as an HBase superuser. You can only restore a backup on a running HBase cluster because the data must be
redistributed the RegionServers for the operation to complete successfully.`}),`
`,e.jsx(e.Fragment,{children:e.jsx(a.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(a.code,{children:e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hbase"}),e.jsx(a.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" restore"}),e.jsx(a.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <"}),e.jsx(a.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"backup_pat"}),e.jsx(a.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"h"}),e.jsx(a.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(a.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <"}),e.jsx(a.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"backup_i"}),e.jsx(a.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"d"}),e.jsx(a.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"})]})})})}),`
`,e.jsx(a.h4,{id:"backup-restore-commands-restoring-a-backup-image-positional-command-line-arguments",children:"Positional Command-Line Arguments"}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:e.jsx(a.em,{children:"backup_path"})}),e.jsx(a.br,{}),`
`,"The ",e.jsx(a.em,{children:"backup_path"}),` argument specifies the full filesystem URI of where to store the backup image. Valid prefixes are
`,e.jsx(a.em,{children:"hdfs:"}),", ",e.jsx(a.em,{children:"webhdfs:"}),", ",e.jsx(a.em,{children:"s3a:"})," or other compatible Hadoop File System implementations."]}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:e.jsx(a.em,{children:"backup_id"})}),e.jsx(a.br,{}),`
`,"The backup ID that uniquely identifies the backup image to be restored."]}),`
`,e.jsx(a.h4,{id:"backup-restore-commands-restoring-a-backup-image-named-command-line-arguments",children:"Named Command-Line Arguments"}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:e.jsx(a.em,{children:"-t <table_name[,table_name]>"})}),e.jsx(a.br,{}),`
`,"A comma-separated list of tables to restore. See ",e.jsx(a.a,{href:"/docs/backup-restore/commands#using-backup-sets",children:"Backup Sets"}),` for more
information about peforming operations on collections of tables. Mutually exclusive with the `,e.jsx(a.em,{children:"-s"}),` option; one of these
named options are required.`]}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:e.jsx(a.em,{children:"-s <backup_set_name>"})}),e.jsx(a.br,{}),`
`,"Identify tables to backup based on a backup set. See ",e.jsx(a.a,{href:"/docs/backup-restore/commands#using-backup-sets",children:"Using Backup Sets"}),` for the purpose and usage
of backup sets. Mutually exclusive with the `,e.jsx(a.em,{children:"-t"})," option."]}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:e.jsx(a.em,{children:"-q <name>"})}),e.jsx(a.br,{}),`
`,`(Optional) Allows specification of the name of a YARN queue which the MapReduce job to create the backup should be executed in. This option
is useful to prevent backup tasks from stealing resources away from other MapReduce jobs of high importance.`]}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:e.jsx(a.em,{children:"-c"})}),e.jsx(a.br,{}),`
`,"(Optional) Perform a dry-run of the restore. The actions are checked, but not executed."]}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:e.jsx(a.em,{children:"-m <target_tables>"})}),e.jsx(a.br,{}),`
`,`(Optional) A comma-separated list of tables to restore into. If this option is not provided, the original table name is used. When
this option is provided, there must be an equal number of entries provided in the `,e.jsx(a.code,{children:"-t"})," option."]}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:e.jsx(a.em,{children:"-o"})}),e.jsx(a.br,{}),`
`,"(Optional) Overwrites the target table for the restore if the table already exists."]}),`
`,e.jsx(a.h4,{id:"example-of-usage",children:"Example of Usage"}),`
`,e.jsx(e.Fragment,{children:e.jsx(a.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(a.code,{children:e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hbase"}),e.jsx(a.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" restore"}),e.jsx(a.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" /tmp/backup_incremental"}),e.jsx(a.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" backupId_1467823988425"}),e.jsx(a.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -t"}),e.jsx(a.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" mytable1,mytable2"})]})})})}),`
`,e.jsxs(a.p,{children:[`This command restores two tables of an incremental backup image. In this example:
• `,e.jsx(a.code,{children:"/tmp/backup_incremental"}),` is the path to the directory containing the backup image.
• `,e.jsx(a.code,{children:"backupId_1467823988425"}),` is the backup ID.
• `,e.jsx(a.code,{children:"mytable1"})," and ",e.jsx(a.code,{children:"mytable2"})," are the names of tables in the backup image to be restored."]}),`
`,e.jsx(t,{type:"info",children:e.jsxs(a.p,{children:[`If the namespace of a table being restored does not exist in the target environment, it will be
automatically created during the restore operation.
`,e.jsx(a.a,{href:"https://issues.apache.org/jira/browse/HBASE-25707",children:"HBASE-25707"})]})}),`
`,e.jsx(a.h3,{id:"merging-incremental-backup-images",children:"Merging Incremental Backup Images"}),`
`,e.jsx(a.p,{children:`This command can be used to merge two or more incremental backup images into a single incremental
backup image. This can be used to consolidate multiple, small incremental backup images into a single
larger incremental backup image. This command could be used to merge hourly incremental backups
into a daily incremental backup image, or daily incremental backups into a weekly incremental backup.`}),`
`,e.jsx(e.Fragment,{children:e.jsx(a.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(a.code,{children:e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(a.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" hbase"}),e.jsx(a.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" backup"}),e.jsx(a.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" merge"}),e.jsx(a.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <"}),e.jsx(a.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"backup_id"}),e.jsx(a.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"s"}),e.jsx(a.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"})]})})})}),`
`,e.jsx(a.h4,{id:"backup-restore-commands-merging-incremental-backup-images-positional-command-line-arguments",children:"Positional Command-Line Arguments"}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:e.jsx(a.em,{children:"backup_ids"})}),e.jsx(a.br,{}),`
`,"A comma-separated list of incremental backup image IDs that are to be combined into a single image."]}),`
`,e.jsx(a.h4,{id:"backup-restore-commands-merging-incremental-backup-images-named-command-line-arguments",children:"Named Command-Line Arguments"}),`
`,e.jsx(a.p,{children:"None."}),`
`,e.jsx(a.h4,{id:"backup-restore-commands-merging-incremental-backup-images-example-usage",children:"Example usage"}),`
`,e.jsx(e.Fragment,{children:e.jsx(a.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(a.code,{children:e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(a.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" hbase"}),e.jsx(a.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" backup"}),e.jsx(a.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" merge"}),e.jsx(a.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" backupId_1467823988425,backupId_1467827588425"})]})})})}),`
`,e.jsx(a.h3,{id:"using-backup-sets",children:"Using Backup Sets"}),`
`,e.jsxs(a.p,{children:[`Backup sets can ease the administration of HBase data backups and restores by reducing the amount of repetitive input
of table names. You can group tables into a named backup set with the `,e.jsx(a.code,{children:"hbase backup set add"}),` command. You can then use
the `,e.jsx(a.code,{children:"-set"})," option to invoke the name of a backup set in the ",e.jsx(a.code,{children:"hbase backup create"})," or ",e.jsx(a.code,{children:"hbase restore"}),` rather than list
individually every table in the group. You can have multiple backup sets.`]}),`
`,e.jsx(t,{type:"info",children:e.jsxs(a.p,{children:["Note the differentiation between the ",e.jsx(a.code,{children:"hbase backup set add"})," command and the ",e.jsx(a.em,{children:"-set"}),` option. The
`,e.jsx(a.code,{children:"hbase backup set add"})," command must be run before using the ",e.jsx(a.code,{children:"-set"}),` option in a different command
because backup sets must be named and defined before using backup sets as a shortcut.`]})}),`
`,e.jsxs(a.p,{children:["If you run the ",e.jsx(a.code,{children:"hbase backup set add"}),` command and specify a backup set name that does not yet exist on your system, a new set
is created. If you run the command with the name of an existing backup set name, then the tables that you specify are added
to the set.`]}),`
`,e.jsx(a.p,{children:"In this command, the backup set name is case-sensitive."}),`
`,e.jsx(t,{type:"info",children:e.jsx(a.p,{children:`The metadata of backup sets are stored within HBase. If you do not have access to the original
HBase cluster with the backup set metadata, then you must specify individual table names to
restore the data.`})}),`
`,e.jsx(a.p,{children:"To create a backup set, run the following command as the HBase superuser:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(a.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(a.code,{children:e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(a.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" hbase"}),e.jsx(a.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" backup"}),e.jsx(a.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" set"}),e.jsx(a.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <"}),e.jsx(a.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"subcomman"}),e.jsx(a.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"d"}),e.jsx(a.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(a.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <"}),e.jsx(a.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"backup_set_nam"}),e.jsx(a.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"e"}),e.jsx(a.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(a.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <"}),e.jsx(a.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"table"}),e.jsx(a.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"s"}),e.jsx(a.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"})]})})})}),`
`,e.jsx(a.h4,{id:"backup-set-subcommands",children:"Backup Set Subcommands"}),`
`,e.jsx(a.p,{children:"The following list details subcommands of the hbase backup set command."}),`
`,e.jsx(t,{type:"info",children:e.jsx(a.p,{children:`You must enter one (and no more than one) of the following subcommands after hbase backup set to
complete an operation. Also, the backup set name is case-sensitive in the command-line utility.`})}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:e.jsx(a.em,{children:"add"})}),e.jsx(a.br,{}),`
`,"Adds table[s] to a backup set. Specify a ",e.jsx(a.em,{children:"backup_set_name"})," value after this argument to create a backup set."]}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:e.jsx(a.em,{children:"remove"})}),e.jsx(a.br,{}),`
`,"Removes tables from the set. Specify the tables to remove in the tables argument."]}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:e.jsx(a.em,{children:"list"})}),e.jsx(a.br,{}),`
`,"Lists all backup sets."]}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:e.jsx(a.em,{children:"describe"})}),e.jsx(a.br,{}),`
`,`Displays a description of a backup set. The information includes whether the set has full
or incremental backups, start and end times of the backups, and a list of the tables in the set. This subcommand must precede
a valid value for the `,e.jsx(a.em,{children:"backup_set_name"})," value."]}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:e.jsx(a.em,{children:"delete"})}),e.jsx(a.br,{}),`
`,"Deletes a backup set. Enter the value for the ",e.jsx(a.em,{children:"backup_set_name"})," option directly after the ",e.jsx(a.code,{children:"hbase backup set delete"})," command."]}),`
`,e.jsx(a.h4,{id:"backup-restore-commands-using-backup-sets-positional-command-line-arguments",children:"Positional Command-Line Arguments"}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:e.jsx(a.em,{children:"backup_set_name"})}),e.jsx(a.br,{}),`
`,"Use to assign or invoke a backup set name. The backup set name must contain only printable characters and cannot have any spaces."]}),`
`,e.jsxs(a.p,{children:[e.jsx(a.strong,{children:e.jsx(a.em,{children:"tables"})}),e.jsx(a.br,{}),`
`,`List of tables (or a single table) to include in the backup set. Enter the table names as a comma-separated list. If no tables
are specified, all tables are included in the set.`]}),`
`,e.jsx(t,{type:"info",children:e.jsx(a.p,{children:`Maintain a log or other record of the case-sensitive backup set names and the corresponding tables
in each set on a separate or remote cluster, backup strategy. This information can help you in
case of failure on the primary cluster.`})}),`
`,e.jsx(a.h4,{id:"example-of-usage-1",children:"Example of Usage"}),`
`,e.jsx(e.Fragment,{children:e.jsx(a.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(a.code,{children:e.jsxs(a.span,{className:"line",children:[e.jsx(a.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(a.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" hbase"}),e.jsx(a.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" backup"}),e.jsx(a.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" set"}),e.jsx(a.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" add"}),e.jsx(a.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" Q1Data"}),e.jsx(a.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" TEAM3,TEAM_4"})]})})})}),`
`,e.jsxs(a.p,{children:["Depending on the environment, this command results in ",e.jsx(a.em,{children:"one"})," of the following actions:"]}),`
`,e.jsxs(a.ul,{children:[`
`,e.jsxs(a.li,{children:["If the ",e.jsx(a.code,{children:"Q1Data"})," backup set does not exist, a backup set containing tables ",e.jsx(a.code,{children:"TEAM_3"})," and ",e.jsx(a.code,{children:"TEAM_4"})," is created."]}),`
`,e.jsxs(a.li,{children:["If the ",e.jsx(a.code,{children:"Q1Data"})," backup set exists already, the tables ",e.jsx(a.code,{children:"TEAM_3"})," and ",e.jsx(a.code,{children:"TEAM_4"})," are added to the ",e.jsx(a.code,{children:"Q1Data"})," backup set."]}),`
`]})]})}function m(n={}){const{wrapper:a}=n.components||{};return a?e.jsx(a,{...n,children:e.jsx(s,{...n})}):s(n)}function i(n,a){throw new Error("Expected component `"+n+"` to be defined: you likely forgot to import, pass, or provide it.")}export{r as _markdown,m as default,l as extractedReferences,c as frontmatter,h as structuredData,d as toc};
