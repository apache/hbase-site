import{j as e}from"./components-BCHf_v1I.js";let l=`The \`hbase backup\` command has several subcommands that help with administering backup images as they accumulate. Most production
environments require recurring backups, so it is necessary to have utilities to help manage the data of the backup repository.
Some subcommands enable you to find information that can help identify backups that are relevant in a search for particular data.
You can also delete backup images.

The following list details each \`hbase backup subcommand\` that can help administer backups. Run the full command-subcommand line as
the HBase superuser.

### Managing Backup Progress

You can monitor a running backup in another terminal session by running the *hbase backup progress* command and specifying the backup ID as an argument.

For example, run the following command as hbase superuser to view the progress of a backup

\`\`\`bash
$ hbase backup progress <backup_id>
\`\`\`

#### Positional Command-Line Arguments

***backup\\_id***\\
Specifies the backup that you want to monitor by seeing the progress information. The backupId is case-sensitive.

#### Named Command-Line Arguments

None.

#### Example usage

\`\`\`bash
hbase backup progress backupId_1467823988425
\`\`\`

### Managing Backup History

This command displays a log of backup sessions. The information for each session includes backup ID, type (full or incremental), the tables
in the backup, status, and start and end time. Specify the number of backup sessions to display with the optional -n argument.

\`\`\`bash
$ hbase backup history <backup_id>
\`\`\`

#### Positional Command-Line Arguments

***backup\\_id***\\
Specifies the backup that you want to monitor by seeing the progress information. The backupId is case-sensitive.

#### Named Command-Line Arguments

***-n \\<num\\_records>***\\
(Optional) The maximum number of backup records (Default: 10).

***-p \\<backup\\_root\\_path>***\\
The full filesystem URI of where backup images are stored.

***-s \\<backup\\_set\\_name>***\\
The name of the backup set to obtain history for. Mutually exclusive with the *-t* option.

***-t \\<table\\_name>***\\
The name of table to obtain history for. Mutually exclusive with the *-s* option.

#### Example usage

\`\`\`bash
$ hbase backup history
$ hbase backup history -n 20
$ hbase backup history -t WebIndexRecords
\`\`\`

### Describing a Backup Image

This command can be used to obtain information about a specific backup image.

\`\`\`bash
$ hbase backup describe <backup_id>
\`\`\`

#### Positional Command-Line Arguments

***backup\\_id***
The ID of the backup image to describe.

#### Named Command-Line Arguments

None.

#### Example usage

\`\`\`bash
$ hbase backup describe backupId_1467823988425
\`\`\`

### Deleting Backup Images

The \`hbase backup delete\` command deletes backup images that are no longer needed.

#### Syntax

\`\`\`bash
$ hbase backup delete -l <backup_id1,backup_id2,...>
$ hbase backup delete -k <days>
\`\`\`

#### Named Command-Line Arguments

***-l \\<backup\\_id1,backup\\_id2,...>***\\
Comma-separated list of backup IDs to delete.

***-k \\<days>***\\
Deletes all backup images completed more than the specified number of days ago.

<Callout type="info">
  These options are **mutually exclusive**. Only one of \`-l\` or \`-k\` may be used at a time.
</Callout>

#### Example Usage

Delete specific backup images by ID:

\`\`\`bash
$ hbase backup delete -l backupId_1467823988425,backupId_1467824989999
\`\`\`

Delete all backup images older than 30 days:

\`\`\`bash
$ hbase backup delete -k 30
\`\`\`

<Callout type="warn">
  * Deleting a backup may affect all following incremental backups (in the same backup root) up to
    the next full backup. For example, if you take a full backup every 2 weeks and
    daily incremental backups, running \`hbase backup delete -k 7\` when the full backup is older than
    7 days will effectively remove the data for all subsequent incremental backups.
    The backup IDs may still be listed, but their data will be gone.

  * If the most recent backup is an incremental backup and you delete it,
    you should run a **full backup** next.
    Running another incremental backup immediately after may result in missing data in the
    backup image. (See [HBASE-28084](https://issues.apache.org/jira/browse/HBASE-28084))
</Callout>

### Backup Repair Command

This command attempts to correct any inconsistencies in persisted backup metadata which exists as
the result of software errors or unhandled failure scenarios. While the backup implementation tries
to correct all errors on its own, this tool may be necessary in the cases where the system cannot
automatically recover on its own.

\`\`\`bash
$ hbase backup repair
\`\`\`

#### Positional Command-Line Arguments

None.

#### Named Command-Line Arguments

None.

#### Example usage

\`\`\`bash
$ hbase backup repair
\`\`\`
`,h={title:"Administration of Backup Images",description:"Managing HBase backup images including listing, describing, deleting, and merging backup sets for efficient storage."},c=[{href:"https://issues.apache.org/jira/browse/HBASE-28084"}],d={contents:[{heading:void 0,content:`The \`hbase backup\` command has several subcommands that help with administering backup images as they accumulate. Most production
environments require recurring backups, so it is necessary to have utilities to help manage the data of the backup repository.
Some subcommands enable you to find information that can help identify backups that are relevant in a search for particular data.
You can also delete backup images.`},{heading:void 0,content:"The following list details each `hbase backup subcommand` that can help administer backups. Run the full command-subcommand line as\nthe HBase superuser."},{heading:"managing-backup-progress",content:"You can monitor a running backup in another terminal session by running the *hbase backup progress* command and specifying the backup ID as an argument."},{heading:"managing-backup-progress",content:"For example, run the following command as hbase superuser to view the progress of a backup"},{heading:"backup-restore-administation-managing-backup-progress-positional-command-line-arguments",content:`***backup\\_id***\\
Specifies the backup that you want to monitor by seeing the progress information. The backupId is case-sensitive.`},{heading:"backup-restore-administation-manging-backup-progress-named-command-line-arguments",content:"None."},{heading:"managing-backup-history",content:`This command displays a log of backup sessions. The information for each session includes backup ID, type (full or incremental), the tables
in the backup, status, and start and end time. Specify the number of backup sessions to display with the optional -n argument.`},{heading:"backup-restore-administation-managing-backup-history-positional-command-line-arguments",content:`***backup\\_id***\\
Specifies the backup that you want to monitor by seeing the progress information. The backupId is case-sensitive.`},{heading:"backup-restore-administation-managing-backup-history-named-command-line-arguments",content:`***-n \\<num\\_records>***\\
(Optional) The maximum number of backup records (Default: 10).`},{heading:"backup-restore-administation-managing-backup-history-named-command-line-arguments",content:`***-p \\<backup\\_root\\_path>***\\
The full filesystem URI of where backup images are stored.`},{heading:"backup-restore-administation-managing-backup-history-named-command-line-arguments",content:"***-s \\<backup\\_set\\_name>***\\&#xA;The name of the backup set to obtain history for. Mutually exclusive with the *-t* option."},{heading:"backup-restore-administation-managing-backup-history-named-command-line-arguments",content:"***-t \\<table\\_name>***\\&#xA;The name of table to obtain history for. Mutually exclusive with the *-s* option."},{heading:"describing-a-backup-image",content:"This command can be used to obtain information about a specific backup image."},{heading:"backup-restore-administation-describing-a-backup-image-command-line-arguments",content:`***backup\\_id***
The ID of the backup image to describe.`},{heading:"backup-restore-administation-describing-a-backup-image-named-command-line-arguments",content:"None."},{heading:"deleting-backup-images",content:"The `hbase backup delete` command deletes backup images that are no longer needed."},{heading:"backup-restore-administation-deleting-backup-images-named-command-line-arguments",content:`***-l \\<backup\\_id1,backup\\_id2,...>***\\
Comma-separated list of backup IDs to delete.`},{heading:"backup-restore-administation-deleting-backup-images-named-command-line-arguments",content:`***-k \\<days>***\\
Deletes all backup images completed more than the specified number of days ago.`},{heading:"backup-restore-administation-deleting-backup-images-named-command-line-arguments",content:"These options are **mutually exclusive**. Only one of `-l` or `-k` may be used at a time."},{heading:"backup-restore-administation-deleting-backup-images-example-usage",content:"Delete specific backup images by ID:"},{heading:"backup-restore-administation-deleting-backup-images-example-usage",content:"Delete all backup images older than 30 days:"},{heading:"backup-restore-administation-deleting-backup-images-example-usage",content:`Deleting a backup may affect all following incremental backups (in the same backup root) up to
the next full backup. For example, if you take a full backup every 2 weeks and
daily incremental backups, running \`hbase backup delete -k 7\` when the full backup is older than
7 days will effectively remove the data for all subsequent incremental backups.
The backup IDs may still be listed, but their data will be gone.`},{heading:"backup-restore-administation-deleting-backup-images-example-usage",content:`If the most recent backup is an incremental backup and you delete it,
you should run a **full backup** next.
Running another incremental backup immediately after may result in missing data in the
backup image. (See HBASE-28084)`},{heading:"backup-repair-command",content:`This command attempts to correct any inconsistencies in persisted backup metadata which exists as
the result of software errors or unhandled failure scenarios. While the backup implementation tries
to correct all errors on its own, this tool may be necessary in the cases where the system cannot
automatically recover on its own.`},{heading:"backup-restore-administation-backup-repair-command-positional-command-line-arguments",content:"None."},{heading:"backup-restore-administation-backup-repair-command-named-command-line-arguments",content:"None."}],headings:[{id:"managing-backup-progress",content:"Managing Backup Progress"},{id:"backup-restore-administation-managing-backup-progress-positional-command-line-arguments",content:"Positional Command-Line Arguments"},{id:"backup-restore-administation-manging-backup-progress-named-command-line-arguments",content:"Named Command-Line Arguments"},{id:"backup-restore-administation-manging-backup-progress-example-usage",content:"Example usage"},{id:"managing-backup-history",content:"Managing Backup History"},{id:"backup-restore-administation-managing-backup-history-positional-command-line-arguments",content:"Positional Command-Line Arguments"},{id:"backup-restore-administation-managing-backup-history-named-command-line-arguments",content:"Named Command-Line Arguments"},{id:"backup-restore-administation-managing-backup-history-example-usage",content:"Example usage"},{id:"describing-a-backup-image",content:"Describing a Backup Image"},{id:"backup-restore-administation-describing-a-backup-image-command-line-arguments",content:"Positional Command-Line Arguments"},{id:"backup-restore-administation-describing-a-backup-image-named-command-line-arguments",content:"Named Command-Line Arguments"},{id:"backup-restore-administation-describing-a-backup-image-example-usage",content:"Example usage"},{id:"deleting-backup-images",content:"Deleting Backup Images"},{id:"syntax",content:"Syntax"},{id:"backup-restore-administation-deleting-backup-images-named-command-line-arguments",content:"Named Command-Line Arguments"},{id:"backup-restore-administation-deleting-backup-images-example-usage",content:"Example Usage"},{id:"backup-repair-command",content:"Backup Repair Command"},{id:"backup-restore-administation-backup-repair-command-positional-command-line-arguments",content:"Positional Command-Line Arguments"},{id:"backup-restore-administation-backup-repair-command-named-command-line-arguments",content:"Named Command-Line Arguments"},{id:"backup-restore-administation-backup-repair-command-example-usage",content:"Example usage"}]},o=[{depth:3,url:"#managing-backup-progress",title:e.jsx(e.Fragment,{children:"Managing Backup Progress"})},{depth:4,url:"#backup-restore-administation-managing-backup-progress-positional-command-line-arguments",title:e.jsx(e.Fragment,{children:"Positional Command-Line Arguments"})},{depth:4,url:"#backup-restore-administation-manging-backup-progress-named-command-line-arguments",title:e.jsx(e.Fragment,{children:"Named Command-Line Arguments"})},{depth:4,url:"#backup-restore-administation-manging-backup-progress-example-usage",title:e.jsx(e.Fragment,{children:"Example usage"})},{depth:3,url:"#managing-backup-history",title:e.jsx(e.Fragment,{children:"Managing Backup History"})},{depth:4,url:"#backup-restore-administation-managing-backup-history-positional-command-line-arguments",title:e.jsx(e.Fragment,{children:"Positional Command-Line Arguments"})},{depth:4,url:"#backup-restore-administation-managing-backup-history-named-command-line-arguments",title:e.jsx(e.Fragment,{children:"Named Command-Line Arguments"})},{depth:4,url:"#backup-restore-administation-managing-backup-history-example-usage",title:e.jsx(e.Fragment,{children:"Example usage"})},{depth:3,url:"#describing-a-backup-image",title:e.jsx(e.Fragment,{children:"Describing a Backup Image"})},{depth:4,url:"#backup-restore-administation-describing-a-backup-image-command-line-arguments",title:e.jsx(e.Fragment,{children:"Positional Command-Line Arguments"})},{depth:4,url:"#backup-restore-administation-describing-a-backup-image-named-command-line-arguments",title:e.jsx(e.Fragment,{children:"Named Command-Line Arguments"})},{depth:4,url:"#backup-restore-administation-describing-a-backup-image-example-usage",title:e.jsx(e.Fragment,{children:"Example usage"})},{depth:3,url:"#deleting-backup-images",title:e.jsx(e.Fragment,{children:"Deleting Backup Images"})},{depth:4,url:"#syntax",title:e.jsx(e.Fragment,{children:"Syntax"})},{depth:4,url:"#backup-restore-administation-deleting-backup-images-named-command-line-arguments",title:e.jsx(e.Fragment,{children:"Named Command-Line Arguments"})},{depth:4,url:"#backup-restore-administation-deleting-backup-images-example-usage",title:e.jsx(e.Fragment,{children:"Example Usage"})},{depth:3,url:"#backup-repair-command",title:e.jsx(e.Fragment,{children:"Backup Repair Command"})},{depth:4,url:"#backup-restore-administation-backup-repair-command-positional-command-line-arguments",title:e.jsx(e.Fragment,{children:"Positional Command-Line Arguments"})},{depth:4,url:"#backup-restore-administation-backup-repair-command-named-command-line-arguments",title:e.jsx(e.Fragment,{children:"Named Command-Line Arguments"})},{depth:4,url:"#backup-restore-administation-backup-repair-command-example-usage",title:e.jsx(e.Fragment,{children:"Example usage"})}];function s(a){const i={a:"a",br:"br",code:"code",em:"em",h3:"h3",h4:"h4",li:"li",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...a.components},{Callout:n}=i;return n||t("Callout"),e.jsxs(e.Fragment,{children:[e.jsxs(i.p,{children:["The ",e.jsx(i.code,{children:"hbase backup"}),` command has several subcommands that help with administering backup images as they accumulate. Most production
environments require recurring backups, so it is necessary to have utilities to help manage the data of the backup repository.
Some subcommands enable you to find information that can help identify backups that are relevant in a search for particular data.
You can also delete backup images.`]}),`
`,e.jsxs(i.p,{children:["The following list details each ",e.jsx(i.code,{children:"hbase backup subcommand"}),` that can help administer backups. Run the full command-subcommand line as
the HBase superuser.`]}),`
`,e.jsx(i.h3,{id:"managing-backup-progress",children:"Managing Backup Progress"}),`
`,e.jsxs(i.p,{children:["You can monitor a running backup in another terminal session by running the ",e.jsx(i.em,{children:"hbase backup progress"})," command and specifying the backup ID as an argument."]}),`
`,e.jsx(i.p,{children:"For example, run the following command as hbase superuser to view the progress of a backup"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" backup"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" progress"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"backup_i"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"d"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"})]})})})}),`
`,e.jsx(i.h4,{id:"backup-restore-administation-managing-backup-progress-positional-command-line-arguments",children:"Positional Command-Line Arguments"}),`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:e.jsx(i.em,{children:"backup_id"})}),e.jsx(i.br,{}),`
`,"Specifies the backup that you want to monitor by seeing the progress information. The backupId is case-sensitive."]}),`
`,e.jsx(i.h4,{id:"backup-restore-administation-manging-backup-progress-named-command-line-arguments",children:"Named Command-Line Arguments"}),`
`,e.jsx(i.p,{children:"None."}),`
`,e.jsx(i.h4,{id:"backup-restore-administation-manging-backup-progress-example-usage",children:"Example usage"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" backup"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" progress"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" backupId_1467823988425"})]})})})}),`
`,e.jsx(i.h3,{id:"managing-backup-history",children:"Managing Backup History"}),`
`,e.jsx(i.p,{children:`This command displays a log of backup sessions. The information for each session includes backup ID, type (full or incremental), the tables
in the backup, status, and start and end time. Specify the number of backup sessions to display with the optional -n argument.`}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" backup"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" history"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"backup_i"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"d"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"})]})})})}),`
`,e.jsx(i.h4,{id:"backup-restore-administation-managing-backup-history-positional-command-line-arguments",children:"Positional Command-Line Arguments"}),`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:e.jsx(i.em,{children:"backup_id"})}),e.jsx(i.br,{}),`
`,"Specifies the backup that you want to monitor by seeing the progress information. The backupId is case-sensitive."]}),`
`,e.jsx(i.h4,{id:"backup-restore-administation-managing-backup-history-named-command-line-arguments",children:"Named Command-Line Arguments"}),`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:e.jsx(i.em,{children:"-n <num_records>"})}),e.jsx(i.br,{}),`
`,"(Optional) The maximum number of backup records (Default: 10)."]}),`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:e.jsx(i.em,{children:"-p <backup_root_path>"})}),e.jsx(i.br,{}),`
`,"The full filesystem URI of where backup images are stored."]}),`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:e.jsx(i.em,{children:"-s <backup_set_name>"})}),e.jsx(i.br,{}),`
`,"The name of the backup set to obtain history for. Mutually exclusive with the ",e.jsx(i.em,{children:"-t"})," option."]}),`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:e.jsx(i.em,{children:"-t <table_name>"})}),e.jsx(i.br,{}),`
`,"The name of table to obtain history for. Mutually exclusive with the ",e.jsx(i.em,{children:"-s"})," option."]}),`
`,e.jsx(i.h4,{id:"backup-restore-administation-managing-backup-history-example-usage",children:"Example usage"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" backup"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" history"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" backup"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" history"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -n"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 20"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" backup"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" history"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -t"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" WebIndexRecords"})]})]})})}),`
`,e.jsx(i.h3,{id:"describing-a-backup-image",children:"Describing a Backup Image"}),`
`,e.jsx(i.p,{children:"This command can be used to obtain information about a specific backup image."}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" backup"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" describe"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"backup_i"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"d"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"})]})})})}),`
`,e.jsx(i.h4,{id:"backup-restore-administation-describing-a-backup-image-command-line-arguments",children:"Positional Command-Line Arguments"}),`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:e.jsx(i.em,{children:"backup_id"})}),`
The ID of the backup image to describe.`]}),`
`,e.jsx(i.h4,{id:"backup-restore-administation-describing-a-backup-image-named-command-line-arguments",children:"Named Command-Line Arguments"}),`
`,e.jsx(i.p,{children:"None."}),`
`,e.jsx(i.h4,{id:"backup-restore-administation-describing-a-backup-image-example-usage",children:"Example usage"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" backup"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" describe"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" backupId_1467823988425"})]})})})}),`
`,e.jsx(i.h3,{id:"deleting-backup-images",children:"Deleting Backup Images"}),`
`,e.jsxs(i.p,{children:["The ",e.jsx(i.code,{children:"hbase backup delete"})," command deletes backup images that are no longer needed."]}),`
`,e.jsx(i.h4,{id:"syntax",children:"Syntax"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" backup"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" delete"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -l"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"backup_id1,backup_id2,.."}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" backup"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" delete"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -k"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" <"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"day"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"s"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"})]})]})})}),`
`,e.jsx(i.h4,{id:"backup-restore-administation-deleting-backup-images-named-command-line-arguments",children:"Named Command-Line Arguments"}),`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:e.jsx(i.em,{children:"-l <backup_id1,backup_id2,...>"})}),e.jsx(i.br,{}),`
`,"Comma-separated list of backup IDs to delete."]}),`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:e.jsx(i.em,{children:"-k <days>"})}),e.jsx(i.br,{}),`
`,"Deletes all backup images completed more than the specified number of days ago."]}),`
`,e.jsx(n,{type:"info",children:e.jsxs(i.p,{children:["These options are ",e.jsx(i.strong,{children:"mutually exclusive"}),". Only one of ",e.jsx(i.code,{children:"-l"})," or ",e.jsx(i.code,{children:"-k"})," may be used at a time."]})}),`
`,e.jsx(i.h4,{id:"backup-restore-administation-deleting-backup-images-example-usage",children:"Example Usage"}),`
`,e.jsx(i.p,{children:"Delete specific backup images by ID:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" backup"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" delete"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -l"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" backupId_1467823988425,backupId_1467824989999"})]})})})}),`
`,e.jsx(i.p,{children:"Delete all backup images older than 30 days:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" backup"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" delete"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -k"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" 30"})]})})})}),`
`,e.jsx(n,{type:"warn",children:e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[`
`,e.jsxs(i.p,{children:[`Deleting a backup may affect all following incremental backups (in the same backup root) up to
the next full backup. For example, if you take a full backup every 2 weeks and
daily incremental backups, running `,e.jsx(i.code,{children:"hbase backup delete -k 7"}),` when the full backup is older than
7 days will effectively remove the data for all subsequent incremental backups.
The backup IDs may still be listed, but their data will be gone.`]}),`
`]}),`
`,e.jsxs(i.li,{children:[`
`,e.jsxs(i.p,{children:[`If the most recent backup is an incremental backup and you delete it,
you should run a `,e.jsx(i.strong,{children:"full backup"}),` next.
Running another incremental backup immediately after may result in missing data in the
backup image. (See `,e.jsx(i.a,{href:"https://issues.apache.org/jira/browse/HBASE-28084",children:"HBASE-28084"}),")"]}),`
`]}),`
`]})}),`
`,e.jsx(i.h3,{id:"backup-repair-command",children:"Backup Repair Command"}),`
`,e.jsx(i.p,{children:`This command attempts to correct any inconsistencies in persisted backup metadata which exists as
the result of software errors or unhandled failure scenarios. While the backup implementation tries
to correct all errors on its own, this tool may be necessary in the cases where the system cannot
automatically recover on its own.`}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" backup"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" repair"})]})})})}),`
`,e.jsx(i.h4,{id:"backup-restore-administation-backup-repair-command-positional-command-line-arguments",children:"Positional Command-Line Arguments"}),`
`,e.jsx(i.p,{children:"None."}),`
`,e.jsx(i.h4,{id:"backup-restore-administation-backup-repair-command-named-command-line-arguments",children:"Named Command-Line Arguments"}),`
`,e.jsx(i.p,{children:"None."}),`
`,e.jsx(i.h4,{id:"backup-restore-administation-backup-repair-command-example-usage",children:"Example usage"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" backup"}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" repair"})]})})})})]})}function m(a={}){const{wrapper:i}=a.components||{};return i?e.jsx(i,{...a,children:e.jsx(s,{...a})}):s(a)}function t(a,i){throw new Error("Expected component `"+a+"` to be defined: you likely forgot to import, pass, or provide it.")}export{l as _markdown,m as default,c as extractedReferences,h as frontmatter,d as structuredData,o as toc};
