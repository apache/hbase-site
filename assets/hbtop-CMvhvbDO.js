import{j as e}from"./components-BCHf_v1I.js";import{_ as r,a as d,b as s,c as o,d as c,e as h,f as l,g as a,h as g,i as m,j as u}from"./help_screen-B7e9751t.js";let j=`





















## Usage

You can run hbtop with the following command:

\`\`\`bash
$ hbase hbtop
\`\`\`

In this case, the values of \`hbase.client.zookeeper.quorum\` and \`zookeeper.znode.parent\` in \`hbase-site.xml\` in the classpath or the default values of them are used to connect.

Or, you can specify your own zookeeper quorum and znode parent as follows:

\`\`\`bash
$ hbase hbtop -Dhbase.client.zookeeper.quorum=<zookeeper quorum> -Dzookeeper.znode.parent=<znode parent>
\`\`\`

<img alt="Top screen" src={__img0} />

The top screen consists of a summary part and of a metrics part.
In the summary part, you can see \`HBase Version\`, \`Cluster ID\`, \`The number of region servers\`, \`Region count\`, \`Average Cluster Load\` and \`Aggregated Request/s\`.
In the metrics part, you can see metrics per Region/Namespace/Table/RegionServer depending on the selected mode.
The top screen is refreshed in a certain period – 3 seconds by default.

### Scrolling metric records

You can scroll the metric records in the metrics part.

<img alt="Scrolling metric records" src={__img1} />

### Command line arguments

| Argument                        | Description                                                                                                                                                                                                                                                |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| -d,--delay \`<arg>\`              | The refresh delay (in seconds); default is 3 seconds                                                                                                                                                                                                       |
| -h,--help                       | Print usage; for help while the tool is running press \`h\` key                                                                                                                                                                                              |
| -m,--mode \`<arg>\`               | The mode; \`n\` (Namespace)\\| \`t\` (Table)\\| \`r\` (Region)\\| \`s\` (RegionServer), default is \`r\`                                                                                                                                                                |
| -n,--numberOfIterations \`<arg>\` | The number of iterations                                                                                                                                                                                                                                   |
| -O,--outputFieldNames           | Print each of the available field names on a separate line, then quit                                                                                                                                                                                      |
| -f,--fields \`<arg>\`             | Show only the given fields. Specify comma separated fields to show multiple fields                                                                                                                                                                         |
| -s,--sortField \`<arg>\`          | The initial sort field. You can prepend a \`+\` or \`-\` to the field name to also override the sort direction. A leading \`+\` will force sorting high to low, whereas a \`-\` will ensure a low to high ordering                                                 |
| -i,--filters \`<arg>\`            | The initial filters. Specify comma separated filters to set multiple filters                                                                                                                                                                               |
| -b,--batchMode                  | Starts hbtop in Batch mode, which could be useful for sending output from hbtop to other programs or to a file. In this mode, hbtop will not accept input and runs until the iterations limit you've set with the \`-n\` command-line option or until killed |

### Modes

There are the following modes in hbtop:

| Mode         | Description                              |
| ------------ | ---------------------------------------- |
| Region       | Showing metric records per region        |
| Namespace    | Showing metric records per namespace     |
| Table        | Showing metric records per table         |
| RegionServer | Showing metric records per region server |
| User         | Showing metric records per user          |
| Client       | Showing metric records per client        |

#### Region mode

In Region mode, the default sort field is \`#REQ/S\`.

The fields in this mode are as follows:

| Field        | Description                            | Displayed by default |
| ------------ | -------------------------------------- | -------------------- |
| RNAME        | Region Name                            | false                |
| NAMESPACE    | Namespace Name                         | true                 |
| TABLE        | Table Name                             | true                 |
| SCODE        | Start Code                             | false                |
| REPID        | Replica ID                             | false                |
| REGION       | Encoded Region Name                    | true                 |
| RS           | Short Region Server Name               | true                 |
| LRS          | Long Region Server Name                | false                |
| #REQ/S       | Request Count per second               | true                 |
| #READ/S      | Read Request Count per second          | true                 |
| #FREAD/S     | Filtered Read Request Count per second | true                 |
| #WRITE/S     | Write Request Count per second         | true                 |
| SF           | StoreFile Size                         | true                 |
| USF          | Uncompressed StoreFile Size            | false                |
| #SF          | Number of StoreFiles                   | true                 |
| MEMSTORE     | MemStore Size                          | true                 |
| LOCALITY     | Block Locality                         | true                 |
| SKEY         | Start Key                              | false                |
| #COMPingCELL | Compacting Cell Count                  | false                |
| #COMPedCELL  | Compacted Cell Count                   | false                |
| %COMP        | Compaction Progress                    | false                |
| LASTMCOMP    | Last Major Compaction Time             | false                |

#### Namespace mode

In Namespace mode, the default sort field is \`#REQ/S\`.

The fields in this mode are as follows:

| Field     | Description                            | Displayed by default |
| --------- | -------------------------------------- | -------------------- |
| NAMESPACE | Namespace Name                         | true                 |
| #REGION   | Region Count                           | true                 |
| #REQ/S    | Request Count per second               | true                 |
| #READ/S   | Read Request Count per second          | true                 |
| #FREAD/S  | Filtered Read Request Count per second | true                 |
| #WRITE/S  | Write Request Count per second         | true                 |
| SF        | StoreFile Size                         | true                 |
| USF       | Uncompressed StoreFile Size            | false                |
| #SF       | Number of StoreFiles                   | true                 |
| MEMSTORE  | MemStore Size                          | true                 |

#### Table mode

In Table mode, the default sort field is \`#REQ/S\`.

The fields in this mode are as follows:

| Field     | Description                            | Displayed by default |
| --------- | -------------------------------------- | -------------------- |
| NAMESPACE | Namespace Name                         | true                 |
| TABLE     | Table Name                             | true                 |
| #REGION   | Region Count                           | true                 |
| #REQ/S    | Request Count per second               | true                 |
| #READ/S   | Read Request Count per second          | true                 |
| #FREAD/S  | Filtered Read Request Count per second | true                 |
| #WRITE/S  | Write Request Count per second         | true                 |
| SF        | StoreFile Size                         | true                 |
| USF       | Uncompressed StoreFile Size            | false                |
| #SF       | Number of StoreFiles                   | true                 |
| MEMSTORE  | MemStore Size                          | true                 |

#### RegionServer mode

In RegionServer mode, the default sort field is \`#REQ/S\`.

The fields in this mode are as follows:

| Field    | Description                            | Displayed by default |
| -------- | -------------------------------------- | -------------------- |
| RS       | Short Region Server Name               | true                 |
| LRS      | Long Region Server Name                | false                |
| #REGION  | Region Count                           | true                 |
| #REQ/S   | Request Count per second               | true                 |
| #READ/S  | Read Request Count per second          | true                 |
| #FREAD/S | Filtered Read Request Count per second | true                 |
| #WRITE/S | Write Request Count per second         | true                 |
| SF       | StoreFile Size                         | true                 |
| USF      | Uncompressed StoreFile Size            | false                |
| #SF      | Number of StoreFiles                   | true                 |
| MEMSTORE | MemStore Size                          | true                 |
| UHEAP    | Used Heap Size                         | true                 |
| MHEAP    | Max Heap Size                          | true                 |

#### User mode

In User mode, the default sort field is \`#REQ/S\`.

The fields in this mode are as follows:

| Field    | Description                            | Displayed by default |
| -------- | -------------------------------------- | -------------------- |
| USER     | user Name                              | true                 |
| #CLIENT  | Client Count                           | true                 |
| #REQ/S   | Request Count per second               | true                 |
| #READ/S  | Read Request Count per second          | true                 |
| #WRITE/S | Write Request Count per second         | true                 |
| #FREAD/S | Filtered Read Request Count per second | true                 |

#### Client mode

In Client mode, the default sort field is \`#REQ/S\`.

The fields in this mode are as follows:

| Field    | Description                            | Displayed by default |
| -------- | -------------------------------------- | -------------------- |
| CLIENT   | Client Hostname                        | true                 |
| #USER    | User Count                             | true                 |
| #REQ/S   | Request Count per second               | true                 |
| #READ/S  | Read Request Count per second          | true                 |
| #WRITE/S | Write Request Count per second         | true                 |
| #FREAD/S | Filtered Read Request Count per second | true                 |

### Changing mode

You can change mode by pressing \`m\` key in the top screen.

<img alt="Changing mode" src={__img2} />

### Changing the refresh delay

You can change the refresh by pressing \`d\` key in the top screen.

<img alt="Changing the refresh delay" src={__img3} />

### Changing the displayed fields

You can move to the field screen by pressing \`f\` key in the top screen. In the fields screen, you can change the displayed fields by choosing a field and pressing \`d\` key or \`space\` key.

<img alt="Changing the displayed fields" src={__img4} />

### Changing the sort field

You can move to the fields screen by pressing \`f\` key in the top screen. In the field screen, you can change the sort field by choosing a field and pressing \`s\`. Also, you can change the sort order (ascending or descending) by pressing \`R\` key.

<img alt="Changing the sort field" src={__img5} />

### Changing the order of the fields

You can move to the fields screen by pressing \`f\` key in the top screen. In the field screen, you can change the order of the fields.

<img alt="Changing the sort field" src={__img6} />

### Filters

You can filter the metric records with the filter feature. We can add filters by pressing \`o\` key for ignoring case or \`O\` key for case sensitive.

<img alt="Adding filters" src={__img7} />

The syntax is as follows:

\`\`\`
<Field><Operator><Value>
\`\`\`

For example, we can add filters like the following:

\`\`\`
NAMESPACE==default
REQ/S>1000
\`\`\`

The operators we can specify are as follows:

| Operator | Description              |
| -------- | ------------------------ |
| =        | Partial match            |
| ==       | Exact match              |
| >        | Greater than             |
| >=       | Greater than or equal to |
| \\<       | Less than                |
| \\<=      | Less than and equal to   |

You can see the current filters by pressing \`^o\` key and clear them by pressing \`=\` key.

<img alt="Showing and clearing filters" src={__img8} />

### Drilling down

You can drill down the metric record by choosing a metric record that you want to drill down and pressing \`i\` key in the top screen. With this feature, you can find hot regions easily in a top-down manner.

<img alt="Drilling down" src={__img9} />

### Help screen

You can see the help screen by pressing \`h\` key in the top screen.

<img alt="Help screen" src={__img10} />

## Others

### How hbtop gets the metrics data

hbtop gets the metrics from ClusterMetrics which is returned as the result of a call to Admin#getClusterMetrics() on the current HMaster. To add metrics to hbtop, they will need to be exposed via ClusterMetrics.
`,f={title:"hbtop",description:"hbtop is a real-time monitoring tool for HBase like Unix's top command. It can display summary information as well as metrics per Region/Namespace/Table/RegionServer. In this tool, you can see the metrics sorted by a selected field and filter the metrics to see only metrics you really want to see."},S=[],R={contents:[{heading:"hbtop-usage",content:"You can run hbtop with the following command:"},{heading:"hbtop-usage",content:"In this case, the values of `hbase.client.zookeeper.quorum` and `zookeeper.znode.parent` in `hbase-site.xml` in the classpath or the default values of them are used to connect."},{heading:"hbtop-usage",content:"Or, you can specify your own zookeeper quorum and znode parent as follows:"},{heading:"hbtop-usage",content:"The top screen consists of a summary part and of a metrics part.\nIn the summary part, you can see `HBase Version`, `Cluster ID`, `The number of region servers`, `Region count`, `Average Cluster Load` and `Aggregated Request/s`.\nIn the metrics part, you can see metrics per Region/Namespace/Table/RegionServer depending on the selected mode.\nThe top screen is refreshed in a certain period – 3 seconds by default."},{heading:"scrolling-metric-records",content:"You can scroll the metric records in the metrics part."},{heading:"command-line-arguments",content:"Argument"},{heading:"command-line-arguments",content:"Description"},{heading:"command-line-arguments",content:"-d,--delay `<arg>`"},{heading:"command-line-arguments",content:"The refresh delay (in seconds); default is 3 seconds"},{heading:"command-line-arguments",content:"-h,--help"},{heading:"command-line-arguments",content:"Print usage; for help while the tool is running press `h` key"},{heading:"command-line-arguments",content:"-m,--mode `<arg>`"},{heading:"command-line-arguments",content:"The mode; `n` (Namespace)\\| `t` (Table)\\| `r` (Region)\\| `s` (RegionServer), default is `r`"},{heading:"command-line-arguments",content:"-n,--numberOfIterations `<arg>`"},{heading:"command-line-arguments",content:"The number of iterations"},{heading:"command-line-arguments",content:"-O,--outputFieldNames"},{heading:"command-line-arguments",content:"Print each of the available field names on a separate line, then quit"},{heading:"command-line-arguments",content:"-f,--fields `<arg>`"},{heading:"command-line-arguments",content:"Show only the given fields. Specify comma separated fields to show multiple fields"},{heading:"command-line-arguments",content:"-s,--sortField `<arg>`"},{heading:"command-line-arguments",content:"The initial sort field. You can prepend a `+` or `-` to the field name to also override the sort direction. A leading `+` will force sorting high to low, whereas a `-` will ensure a low to high ordering"},{heading:"command-line-arguments",content:"-i,--filters `<arg>`"},{heading:"command-line-arguments",content:"The initial filters. Specify comma separated filters to set multiple filters"},{heading:"command-line-arguments",content:"-b,--batchMode"},{heading:"command-line-arguments",content:"Starts hbtop in Batch mode, which could be useful for sending output from hbtop to other programs or to a file. In this mode, hbtop will not accept input and runs until the iterations limit you've set with the `-n` command-line option or until killed"},{heading:"modes",content:"There are the following modes in hbtop:"},{heading:"modes",content:"Mode"},{heading:"modes",content:"Description"},{heading:"modes",content:"Region"},{heading:"modes",content:"Showing metric records per region"},{heading:"modes",content:"Namespace"},{heading:"modes",content:"Showing metric records per namespace"},{heading:"modes",content:"Table"},{heading:"modes",content:"Showing metric records per table"},{heading:"modes",content:"RegionServer"},{heading:"modes",content:"Showing metric records per region server"},{heading:"modes",content:"User"},{heading:"modes",content:"Showing metric records per user"},{heading:"modes",content:"Client"},{heading:"modes",content:"Showing metric records per client"},{heading:"region-mode",content:"In Region mode, the default sort field is `#REQ/S`."},{heading:"region-mode",content:"The fields in this mode are as follows:"},{heading:"region-mode",content:"Field"},{heading:"region-mode",content:"Description"},{heading:"region-mode",content:"Displayed by default"},{heading:"region-mode",content:"RNAME"},{heading:"region-mode",content:"Region Name"},{heading:"region-mode",content:"false"},{heading:"region-mode",content:"NAMESPACE"},{heading:"region-mode",content:"Namespace Name"},{heading:"region-mode",content:"true"},{heading:"region-mode",content:"TABLE"},{heading:"region-mode",content:"Table Name"},{heading:"region-mode",content:"true"},{heading:"region-mode",content:"SCODE"},{heading:"region-mode",content:"Start Code"},{heading:"region-mode",content:"false"},{heading:"region-mode",content:"REPID"},{heading:"region-mode",content:"Replica ID"},{heading:"region-mode",content:"false"},{heading:"region-mode",content:"REGION"},{heading:"region-mode",content:"Encoded Region Name"},{heading:"region-mode",content:"true"},{heading:"region-mode",content:"RS"},{heading:"region-mode",content:"Short Region Server Name"},{heading:"region-mode",content:"true"},{heading:"region-mode",content:"LRS"},{heading:"region-mode",content:"Long Region Server Name"},{heading:"region-mode",content:"false"},{heading:"region-mode",content:"#REQ/S"},{heading:"region-mode",content:"Request Count per second"},{heading:"region-mode",content:"true"},{heading:"region-mode",content:"#READ/S"},{heading:"region-mode",content:"Read Request Count per second"},{heading:"region-mode",content:"true"},{heading:"region-mode",content:"#FREAD/S"},{heading:"region-mode",content:"Filtered Read Request Count per second"},{heading:"region-mode",content:"true"},{heading:"region-mode",content:"#WRITE/S"},{heading:"region-mode",content:"Write Request Count per second"},{heading:"region-mode",content:"true"},{heading:"region-mode",content:"SF"},{heading:"region-mode",content:"StoreFile Size"},{heading:"region-mode",content:"true"},{heading:"region-mode",content:"USF"},{heading:"region-mode",content:"Uncompressed StoreFile Size"},{heading:"region-mode",content:"false"},{heading:"region-mode",content:"#SF"},{heading:"region-mode",content:"Number of StoreFiles"},{heading:"region-mode",content:"true"},{heading:"region-mode",content:"MEMSTORE"},{heading:"region-mode",content:"MemStore Size"},{heading:"region-mode",content:"true"},{heading:"region-mode",content:"LOCALITY"},{heading:"region-mode",content:"Block Locality"},{heading:"region-mode",content:"true"},{heading:"region-mode",content:"SKEY"},{heading:"region-mode",content:"Start Key"},{heading:"region-mode",content:"false"},{heading:"region-mode",content:"#COMPingCELL"},{heading:"region-mode",content:"Compacting Cell Count"},{heading:"region-mode",content:"false"},{heading:"region-mode",content:"#COMPedCELL"},{heading:"region-mode",content:"Compacted Cell Count"},{heading:"region-mode",content:"false"},{heading:"region-mode",content:"%COMP"},{heading:"region-mode",content:"Compaction Progress"},{heading:"region-mode",content:"false"},{heading:"region-mode",content:"LASTMCOMP"},{heading:"region-mode",content:"Last Major Compaction Time"},{heading:"region-mode",content:"false"},{heading:"namespace-mode",content:"In Namespace mode, the default sort field is `#REQ/S`."},{heading:"namespace-mode",content:"The fields in this mode are as follows:"},{heading:"namespace-mode",content:"Field"},{heading:"namespace-mode",content:"Description"},{heading:"namespace-mode",content:"Displayed by default"},{heading:"namespace-mode",content:"NAMESPACE"},{heading:"namespace-mode",content:"Namespace Name"},{heading:"namespace-mode",content:"true"},{heading:"namespace-mode",content:"#REGION"},{heading:"namespace-mode",content:"Region Count"},{heading:"namespace-mode",content:"true"},{heading:"namespace-mode",content:"#REQ/S"},{heading:"namespace-mode",content:"Request Count per second"},{heading:"namespace-mode",content:"true"},{heading:"namespace-mode",content:"#READ/S"},{heading:"namespace-mode",content:"Read Request Count per second"},{heading:"namespace-mode",content:"true"},{heading:"namespace-mode",content:"#FREAD/S"},{heading:"namespace-mode",content:"Filtered Read Request Count per second"},{heading:"namespace-mode",content:"true"},{heading:"namespace-mode",content:"#WRITE/S"},{heading:"namespace-mode",content:"Write Request Count per second"},{heading:"namespace-mode",content:"true"},{heading:"namespace-mode",content:"SF"},{heading:"namespace-mode",content:"StoreFile Size"},{heading:"namespace-mode",content:"true"},{heading:"namespace-mode",content:"USF"},{heading:"namespace-mode",content:"Uncompressed StoreFile Size"},{heading:"namespace-mode",content:"false"},{heading:"namespace-mode",content:"#SF"},{heading:"namespace-mode",content:"Number of StoreFiles"},{heading:"namespace-mode",content:"true"},{heading:"namespace-mode",content:"MEMSTORE"},{heading:"namespace-mode",content:"MemStore Size"},{heading:"namespace-mode",content:"true"},{heading:"table-mode",content:"In Table mode, the default sort field is `#REQ/S`."},{heading:"table-mode",content:"The fields in this mode are as follows:"},{heading:"table-mode",content:"Field"},{heading:"table-mode",content:"Description"},{heading:"table-mode",content:"Displayed by default"},{heading:"table-mode",content:"NAMESPACE"},{heading:"table-mode",content:"Namespace Name"},{heading:"table-mode",content:"true"},{heading:"table-mode",content:"TABLE"},{heading:"table-mode",content:"Table Name"},{heading:"table-mode",content:"true"},{heading:"table-mode",content:"#REGION"},{heading:"table-mode",content:"Region Count"},{heading:"table-mode",content:"true"},{heading:"table-mode",content:"#REQ/S"},{heading:"table-mode",content:"Request Count per second"},{heading:"table-mode",content:"true"},{heading:"table-mode",content:"#READ/S"},{heading:"table-mode",content:"Read Request Count per second"},{heading:"table-mode",content:"true"},{heading:"table-mode",content:"#FREAD/S"},{heading:"table-mode",content:"Filtered Read Request Count per second"},{heading:"table-mode",content:"true"},{heading:"table-mode",content:"#WRITE/S"},{heading:"table-mode",content:"Write Request Count per second"},{heading:"table-mode",content:"true"},{heading:"table-mode",content:"SF"},{heading:"table-mode",content:"StoreFile Size"},{heading:"table-mode",content:"true"},{heading:"table-mode",content:"USF"},{heading:"table-mode",content:"Uncompressed StoreFile Size"},{heading:"table-mode",content:"false"},{heading:"table-mode",content:"#SF"},{heading:"table-mode",content:"Number of StoreFiles"},{heading:"table-mode",content:"true"},{heading:"table-mode",content:"MEMSTORE"},{heading:"table-mode",content:"MemStore Size"},{heading:"table-mode",content:"true"},{heading:"regionserver-mode",content:"In RegionServer mode, the default sort field is `#REQ/S`."},{heading:"regionserver-mode",content:"The fields in this mode are as follows:"},{heading:"regionserver-mode",content:"Field"},{heading:"regionserver-mode",content:"Description"},{heading:"regionserver-mode",content:"Displayed by default"},{heading:"regionserver-mode",content:"RS"},{heading:"regionserver-mode",content:"Short Region Server Name"},{heading:"regionserver-mode",content:"true"},{heading:"regionserver-mode",content:"LRS"},{heading:"regionserver-mode",content:"Long Region Server Name"},{heading:"regionserver-mode",content:"false"},{heading:"regionserver-mode",content:"#REGION"},{heading:"regionserver-mode",content:"Region Count"},{heading:"regionserver-mode",content:"true"},{heading:"regionserver-mode",content:"#REQ/S"},{heading:"regionserver-mode",content:"Request Count per second"},{heading:"regionserver-mode",content:"true"},{heading:"regionserver-mode",content:"#READ/S"},{heading:"regionserver-mode",content:"Read Request Count per second"},{heading:"regionserver-mode",content:"true"},{heading:"regionserver-mode",content:"#FREAD/S"},{heading:"regionserver-mode",content:"Filtered Read Request Count per second"},{heading:"regionserver-mode",content:"true"},{heading:"regionserver-mode",content:"#WRITE/S"},{heading:"regionserver-mode",content:"Write Request Count per second"},{heading:"regionserver-mode",content:"true"},{heading:"regionserver-mode",content:"SF"},{heading:"regionserver-mode",content:"StoreFile Size"},{heading:"regionserver-mode",content:"true"},{heading:"regionserver-mode",content:"USF"},{heading:"regionserver-mode",content:"Uncompressed StoreFile Size"},{heading:"regionserver-mode",content:"false"},{heading:"regionserver-mode",content:"#SF"},{heading:"regionserver-mode",content:"Number of StoreFiles"},{heading:"regionserver-mode",content:"true"},{heading:"regionserver-mode",content:"MEMSTORE"},{heading:"regionserver-mode",content:"MemStore Size"},{heading:"regionserver-mode",content:"true"},{heading:"regionserver-mode",content:"UHEAP"},{heading:"regionserver-mode",content:"Used Heap Size"},{heading:"regionserver-mode",content:"true"},{heading:"regionserver-mode",content:"MHEAP"},{heading:"regionserver-mode",content:"Max Heap Size"},{heading:"regionserver-mode",content:"true"},{heading:"user-mode",content:"In User mode, the default sort field is `#REQ/S`."},{heading:"user-mode",content:"The fields in this mode are as follows:"},{heading:"user-mode",content:"Field"},{heading:"user-mode",content:"Description"},{heading:"user-mode",content:"Displayed by default"},{heading:"user-mode",content:"USER"},{heading:"user-mode",content:"user Name"},{heading:"user-mode",content:"true"},{heading:"user-mode",content:"#CLIENT"},{heading:"user-mode",content:"Client Count"},{heading:"user-mode",content:"true"},{heading:"user-mode",content:"#REQ/S"},{heading:"user-mode",content:"Request Count per second"},{heading:"user-mode",content:"true"},{heading:"user-mode",content:"#READ/S"},{heading:"user-mode",content:"Read Request Count per second"},{heading:"user-mode",content:"true"},{heading:"user-mode",content:"#WRITE/S"},{heading:"user-mode",content:"Write Request Count per second"},{heading:"user-mode",content:"true"},{heading:"user-mode",content:"#FREAD/S"},{heading:"user-mode",content:"Filtered Read Request Count per second"},{heading:"user-mode",content:"true"},{heading:"client-mode",content:"In Client mode, the default sort field is `#REQ/S`."},{heading:"client-mode",content:"The fields in this mode are as follows:"},{heading:"client-mode",content:"Field"},{heading:"client-mode",content:"Description"},{heading:"client-mode",content:"Displayed by default"},{heading:"client-mode",content:"CLIENT"},{heading:"client-mode",content:"Client Hostname"},{heading:"client-mode",content:"true"},{heading:"client-mode",content:"#USER"},{heading:"client-mode",content:"User Count"},{heading:"client-mode",content:"true"},{heading:"client-mode",content:"#REQ/S"},{heading:"client-mode",content:"Request Count per second"},{heading:"client-mode",content:"true"},{heading:"client-mode",content:"#READ/S"},{heading:"client-mode",content:"Read Request Count per second"},{heading:"client-mode",content:"true"},{heading:"client-mode",content:"#WRITE/S"},{heading:"client-mode",content:"Write Request Count per second"},{heading:"client-mode",content:"true"},{heading:"client-mode",content:"#FREAD/S"},{heading:"client-mode",content:"Filtered Read Request Count per second"},{heading:"client-mode",content:"true"},{heading:"changing-mode",content:"You can change mode by pressing `m` key in the top screen."},{heading:"changing-the-refresh-delay",content:"You can change the refresh by pressing `d` key in the top screen."},{heading:"changing-the-displayed-fields",content:"You can move to the field screen by pressing `f` key in the top screen. In the fields screen, you can change the displayed fields by choosing a field and pressing `d` key or `space` key."},{heading:"changing-the-sort-field",content:"You can move to the fields screen by pressing `f` key in the top screen. In the field screen, you can change the sort field by choosing a field and pressing `s`. Also, you can change the sort order (ascending or descending) by pressing `R` key."},{heading:"changing-the-order-of-the-fields",content:"You can move to the fields screen by pressing `f` key in the top screen. In the field screen, you can change the order of the fields."},{heading:"filters",content:"You can filter the metric records with the filter feature. We can add filters by pressing `o` key for ignoring case or `O` key for case sensitive."},{heading:"filters",content:"The syntax is as follows:"},{heading:"filters",content:"For example, we can add filters like the following:"},{heading:"filters",content:"The operators we can specify are as follows:"},{heading:"filters",content:"Operator"},{heading:"filters",content:"Description"},{heading:"filters",content:"="},{heading:"filters",content:"Partial match"},{heading:"filters",content:"=="},{heading:"filters",content:"Exact match"},{heading:"filters",content:">"},{heading:"filters",content:"Greater than"},{heading:"filters",content:">="},{heading:"filters",content:"Greater than or equal to"},{heading:"filters",content:"\\<"},{heading:"filters",content:"Less than"},{heading:"filters",content:"\\<="},{heading:"filters",content:"Less than and equal to"},{heading:"filters",content:"You can see the current filters by pressing `^o` key and clear them by pressing `=` key."},{heading:"drilling-down",content:"You can drill down the metric record by choosing a metric record that you want to drill down and pressing `i` key in the top screen. With this feature, you can find hot regions easily in a top-down manner."},{heading:"help-screen",content:"You can see the help screen by pressing `h` key in the top screen."},{heading:"how-hbtop-gets-the-metrics-data",content:"hbtop gets the metrics from ClusterMetrics which is returned as the result of a call to Admin#getClusterMetrics() on the current HMaster. To add metrics to hbtop, they will need to be exposed via ClusterMetrics."}],headings:[{id:"hbtop-usage",content:"Usage"},{id:"scrolling-metric-records",content:"Scrolling metric records"},{id:"command-line-arguments",content:"Command line arguments"},{id:"modes",content:"Modes"},{id:"region-mode",content:"Region mode"},{id:"namespace-mode",content:"Namespace mode"},{id:"table-mode",content:"Table mode"},{id:"regionserver-mode",content:"RegionServer mode"},{id:"user-mode",content:"User mode"},{id:"client-mode",content:"Client mode"},{id:"changing-mode",content:"Changing mode"},{id:"changing-the-refresh-delay",content:"Changing the refresh delay"},{id:"changing-the-displayed-fields",content:"Changing the displayed fields"},{id:"changing-the-sort-field",content:"Changing the sort field"},{id:"changing-the-order-of-the-fields",content:"Changing the order of the fields"},{id:"filters",content:"Filters"},{id:"drilling-down",content:"Drilling down"},{id:"help-screen",content:"Help screen"},{id:"hbtop-others",content:"Others"},{id:"how-hbtop-gets-the-metrics-data",content:"How hbtop gets the metrics data"}]},b=[{depth:2,url:"#hbtop-usage",title:e.jsx(e.Fragment,{children:"Usage"})},{depth:3,url:"#scrolling-metric-records",title:e.jsx(e.Fragment,{children:"Scrolling metric records"})},{depth:3,url:"#command-line-arguments",title:e.jsx(e.Fragment,{children:"Command line arguments"})},{depth:3,url:"#modes",title:e.jsx(e.Fragment,{children:"Modes"})},{depth:4,url:"#region-mode",title:e.jsx(e.Fragment,{children:"Region mode"})},{depth:4,url:"#namespace-mode",title:e.jsx(e.Fragment,{children:"Namespace mode"})},{depth:4,url:"#table-mode",title:e.jsx(e.Fragment,{children:"Table mode"})},{depth:4,url:"#regionserver-mode",title:e.jsx(e.Fragment,{children:"RegionServer mode"})},{depth:4,url:"#user-mode",title:e.jsx(e.Fragment,{children:"User mode"})},{depth:4,url:"#client-mode",title:e.jsx(e.Fragment,{children:"Client mode"})},{depth:3,url:"#changing-mode",title:e.jsx(e.Fragment,{children:"Changing mode"})},{depth:3,url:"#changing-the-refresh-delay",title:e.jsx(e.Fragment,{children:"Changing the refresh delay"})},{depth:3,url:"#changing-the-displayed-fields",title:e.jsx(e.Fragment,{children:"Changing the displayed fields"})},{depth:3,url:"#changing-the-sort-field",title:e.jsx(e.Fragment,{children:"Changing the sort field"})},{depth:3,url:"#changing-the-order-of-the-fields",title:e.jsx(e.Fragment,{children:"Changing the order of the fields"})},{depth:3,url:"#filters",title:e.jsx(e.Fragment,{children:"Filters"})},{depth:3,url:"#drilling-down",title:e.jsx(e.Fragment,{children:"Drilling down"})},{depth:3,url:"#help-screen",title:e.jsx(e.Fragment,{children:"Help screen"})},{depth:2,url:"#hbtop-others",title:e.jsx(e.Fragment,{children:"Others"})},{depth:3,url:"#how-hbtop-gets-the-metrics-data",title:e.jsx(e.Fragment,{children:"How hbtop gets the metrics data"})}];function i(t){const n={code:"code",h2:"h2",h3:"h3",h4:"h4",img:"img",p:"p",pre:"pre",span:"span",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...t.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.h2,{id:"hbtop-usage",children:"Usage"}),`
`,e.jsx(n.p,{children:"You can run hbtop with the following command:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" hbase"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" hbtop"})]})})})}),`
`,e.jsxs(n.p,{children:["In this case, the values of ",e.jsx(n.code,{children:"hbase.client.zookeeper.quorum"})," and ",e.jsx(n.code,{children:"zookeeper.znode.parent"})," in ",e.jsx(n.code,{children:"hbase-site.xml"})," in the classpath or the default values of them are used to connect."]}),`
`,e.jsx(n.p,{children:"Or, you can specify your own zookeeper quorum and znode parent as follows:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" hbase"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" hbtop"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -Dhbase.client.zookeeper.quorum="}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"zookeeper"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" quoru"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"m"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -Dzookeeper.znode.parent="}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"znode"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" paren"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"t"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"})]})})})}),`
`,e.jsx(n.p,{children:e.jsx(n.img,{alt:"Top screen",src:r})}),`
`,e.jsxs(n.p,{children:[`The top screen consists of a summary part and of a metrics part.
In the summary part, you can see `,e.jsx(n.code,{children:"HBase Version"}),", ",e.jsx(n.code,{children:"Cluster ID"}),", ",e.jsx(n.code,{children:"The number of region servers"}),", ",e.jsx(n.code,{children:"Region count"}),", ",e.jsx(n.code,{children:"Average Cluster Load"})," and ",e.jsx(n.code,{children:"Aggregated Request/s"}),`.
In the metrics part, you can see metrics per Region/Namespace/Table/RegionServer depending on the selected mode.
The top screen is refreshed in a certain period – 3 seconds by default.`]}),`
`,e.jsx(n.h3,{id:"scrolling-metric-records",children:"Scrolling metric records"}),`
`,e.jsx(n.p,{children:"You can scroll the metric records in the metrics part."}),`
`,e.jsx(n.p,{children:e.jsx(n.img,{alt:"Scrolling metric records",src:d})}),`
`,e.jsx(n.h3,{id:"command-line-arguments",children:"Command line arguments"}),`
`,e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Argument"}),e.jsx(n.th,{children:"Description"})]})}),e.jsxs(n.tbody,{children:[e.jsxs(n.tr,{children:[e.jsxs(n.td,{children:["-d,--delay ",e.jsx(n.code,{children:"<arg>"})]}),e.jsx(n.td,{children:"The refresh delay (in seconds); default is 3 seconds"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"-h,--help"}),e.jsxs(n.td,{children:["Print usage; for help while the tool is running press ",e.jsx(n.code,{children:"h"})," key"]})]}),e.jsxs(n.tr,{children:[e.jsxs(n.td,{children:["-m,--mode ",e.jsx(n.code,{children:"<arg>"})]}),e.jsxs(n.td,{children:["The mode; ",e.jsx(n.code,{children:"n"})," (Namespace)| ",e.jsx(n.code,{children:"t"})," (Table)| ",e.jsx(n.code,{children:"r"})," (Region)| ",e.jsx(n.code,{children:"s"})," (RegionServer), default is ",e.jsx(n.code,{children:"r"})]})]}),e.jsxs(n.tr,{children:[e.jsxs(n.td,{children:["-n,--numberOfIterations ",e.jsx(n.code,{children:"<arg>"})]}),e.jsx(n.td,{children:"The number of iterations"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"-O,--outputFieldNames"}),e.jsx(n.td,{children:"Print each of the available field names on a separate line, then quit"})]}),e.jsxs(n.tr,{children:[e.jsxs(n.td,{children:["-f,--fields ",e.jsx(n.code,{children:"<arg>"})]}),e.jsx(n.td,{children:"Show only the given fields. Specify comma separated fields to show multiple fields"})]}),e.jsxs(n.tr,{children:[e.jsxs(n.td,{children:["-s,--sortField ",e.jsx(n.code,{children:"<arg>"})]}),e.jsxs(n.td,{children:["The initial sort field. You can prepend a ",e.jsx(n.code,{children:"+"})," or ",e.jsx(n.code,{children:"-"})," to the field name to also override the sort direction. A leading ",e.jsx(n.code,{children:"+"})," will force sorting high to low, whereas a ",e.jsx(n.code,{children:"-"})," will ensure a low to high ordering"]})]}),e.jsxs(n.tr,{children:[e.jsxs(n.td,{children:["-i,--filters ",e.jsx(n.code,{children:"<arg>"})]}),e.jsx(n.td,{children:"The initial filters. Specify comma separated filters to set multiple filters"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"-b,--batchMode"}),e.jsxs(n.td,{children:["Starts hbtop in Batch mode, which could be useful for sending output from hbtop to other programs or to a file. In this mode, hbtop will not accept input and runs until the iterations limit you've set with the ",e.jsx(n.code,{children:"-n"})," command-line option or until killed"]})]})]})]}),`
`,e.jsx(n.h3,{id:"modes",children:"Modes"}),`
`,e.jsx(n.p,{children:"There are the following modes in hbtop:"}),`
`,e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Mode"}),e.jsx(n.th,{children:"Description"})]})}),e.jsxs(n.tbody,{children:[e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Region"}),e.jsx(n.td,{children:"Showing metric records per region"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Namespace"}),e.jsx(n.td,{children:"Showing metric records per namespace"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Table"}),e.jsx(n.td,{children:"Showing metric records per table"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"RegionServer"}),e.jsx(n.td,{children:"Showing metric records per region server"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"User"}),e.jsx(n.td,{children:"Showing metric records per user"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"Client"}),e.jsx(n.td,{children:"Showing metric records per client"})]})]})]}),`
`,e.jsx(n.h4,{id:"region-mode",children:"Region mode"}),`
`,e.jsxs(n.p,{children:["In Region mode, the default sort field is ",e.jsx(n.code,{children:"#REQ/S"}),"."]}),`
`,e.jsx(n.p,{children:"The fields in this mode are as follows:"}),`
`,e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Field"}),e.jsx(n.th,{children:"Description"}),e.jsx(n.th,{children:"Displayed by default"})]})}),e.jsxs(n.tbody,{children:[e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"RNAME"}),e.jsx(n.td,{children:"Region Name"}),e.jsx(n.td,{children:"false"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"NAMESPACE"}),e.jsx(n.td,{children:"Namespace Name"}),e.jsx(n.td,{children:"true"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"TABLE"}),e.jsx(n.td,{children:"Table Name"}),e.jsx(n.td,{children:"true"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"SCODE"}),e.jsx(n.td,{children:"Start Code"}),e.jsx(n.td,{children:"false"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"REPID"}),e.jsx(n.td,{children:"Replica ID"}),e.jsx(n.td,{children:"false"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"REGION"}),e.jsx(n.td,{children:"Encoded Region Name"}),e.jsx(n.td,{children:"true"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"RS"}),e.jsx(n.td,{children:"Short Region Server Name"}),e.jsx(n.td,{children:"true"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"LRS"}),e.jsx(n.td,{children:"Long Region Server Name"}),e.jsx(n.td,{children:"false"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"#REQ/S"}),e.jsx(n.td,{children:"Request Count per second"}),e.jsx(n.td,{children:"true"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"#READ/S"}),e.jsx(n.td,{children:"Read Request Count per second"}),e.jsx(n.td,{children:"true"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"#FREAD/S"}),e.jsx(n.td,{children:"Filtered Read Request Count per second"}),e.jsx(n.td,{children:"true"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"#WRITE/S"}),e.jsx(n.td,{children:"Write Request Count per second"}),e.jsx(n.td,{children:"true"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"SF"}),e.jsx(n.td,{children:"StoreFile Size"}),e.jsx(n.td,{children:"true"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"USF"}),e.jsx(n.td,{children:"Uncompressed StoreFile Size"}),e.jsx(n.td,{children:"false"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"#SF"}),e.jsx(n.td,{children:"Number of StoreFiles"}),e.jsx(n.td,{children:"true"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"MEMSTORE"}),e.jsx(n.td,{children:"MemStore Size"}),e.jsx(n.td,{children:"true"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"LOCALITY"}),e.jsx(n.td,{children:"Block Locality"}),e.jsx(n.td,{children:"true"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"SKEY"}),e.jsx(n.td,{children:"Start Key"}),e.jsx(n.td,{children:"false"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"#COMPingCELL"}),e.jsx(n.td,{children:"Compacting Cell Count"}),e.jsx(n.td,{children:"false"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"#COMPedCELL"}),e.jsx(n.td,{children:"Compacted Cell Count"}),e.jsx(n.td,{children:"false"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"%COMP"}),e.jsx(n.td,{children:"Compaction Progress"}),e.jsx(n.td,{children:"false"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"LASTMCOMP"}),e.jsx(n.td,{children:"Last Major Compaction Time"}),e.jsx(n.td,{children:"false"})]})]})]}),`
`,e.jsx(n.h4,{id:"namespace-mode",children:"Namespace mode"}),`
`,e.jsxs(n.p,{children:["In Namespace mode, the default sort field is ",e.jsx(n.code,{children:"#REQ/S"}),"."]}),`
`,e.jsx(n.p,{children:"The fields in this mode are as follows:"}),`
`,e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Field"}),e.jsx(n.th,{children:"Description"}),e.jsx(n.th,{children:"Displayed by default"})]})}),e.jsxs(n.tbody,{children:[e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"NAMESPACE"}),e.jsx(n.td,{children:"Namespace Name"}),e.jsx(n.td,{children:"true"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"#REGION"}),e.jsx(n.td,{children:"Region Count"}),e.jsx(n.td,{children:"true"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"#REQ/S"}),e.jsx(n.td,{children:"Request Count per second"}),e.jsx(n.td,{children:"true"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"#READ/S"}),e.jsx(n.td,{children:"Read Request Count per second"}),e.jsx(n.td,{children:"true"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"#FREAD/S"}),e.jsx(n.td,{children:"Filtered Read Request Count per second"}),e.jsx(n.td,{children:"true"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"#WRITE/S"}),e.jsx(n.td,{children:"Write Request Count per second"}),e.jsx(n.td,{children:"true"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"SF"}),e.jsx(n.td,{children:"StoreFile Size"}),e.jsx(n.td,{children:"true"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"USF"}),e.jsx(n.td,{children:"Uncompressed StoreFile Size"}),e.jsx(n.td,{children:"false"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"#SF"}),e.jsx(n.td,{children:"Number of StoreFiles"}),e.jsx(n.td,{children:"true"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"MEMSTORE"}),e.jsx(n.td,{children:"MemStore Size"}),e.jsx(n.td,{children:"true"})]})]})]}),`
`,e.jsx(n.h4,{id:"table-mode",children:"Table mode"}),`
`,e.jsxs(n.p,{children:["In Table mode, the default sort field is ",e.jsx(n.code,{children:"#REQ/S"}),"."]}),`
`,e.jsx(n.p,{children:"The fields in this mode are as follows:"}),`
`,e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Field"}),e.jsx(n.th,{children:"Description"}),e.jsx(n.th,{children:"Displayed by default"})]})}),e.jsxs(n.tbody,{children:[e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"NAMESPACE"}),e.jsx(n.td,{children:"Namespace Name"}),e.jsx(n.td,{children:"true"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"TABLE"}),e.jsx(n.td,{children:"Table Name"}),e.jsx(n.td,{children:"true"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"#REGION"}),e.jsx(n.td,{children:"Region Count"}),e.jsx(n.td,{children:"true"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"#REQ/S"}),e.jsx(n.td,{children:"Request Count per second"}),e.jsx(n.td,{children:"true"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"#READ/S"}),e.jsx(n.td,{children:"Read Request Count per second"}),e.jsx(n.td,{children:"true"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"#FREAD/S"}),e.jsx(n.td,{children:"Filtered Read Request Count per second"}),e.jsx(n.td,{children:"true"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"#WRITE/S"}),e.jsx(n.td,{children:"Write Request Count per second"}),e.jsx(n.td,{children:"true"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"SF"}),e.jsx(n.td,{children:"StoreFile Size"}),e.jsx(n.td,{children:"true"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"USF"}),e.jsx(n.td,{children:"Uncompressed StoreFile Size"}),e.jsx(n.td,{children:"false"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"#SF"}),e.jsx(n.td,{children:"Number of StoreFiles"}),e.jsx(n.td,{children:"true"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"MEMSTORE"}),e.jsx(n.td,{children:"MemStore Size"}),e.jsx(n.td,{children:"true"})]})]})]}),`
`,e.jsx(n.h4,{id:"regionserver-mode",children:"RegionServer mode"}),`
`,e.jsxs(n.p,{children:["In RegionServer mode, the default sort field is ",e.jsx(n.code,{children:"#REQ/S"}),"."]}),`
`,e.jsx(n.p,{children:"The fields in this mode are as follows:"}),`
`,e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Field"}),e.jsx(n.th,{children:"Description"}),e.jsx(n.th,{children:"Displayed by default"})]})}),e.jsxs(n.tbody,{children:[e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"RS"}),e.jsx(n.td,{children:"Short Region Server Name"}),e.jsx(n.td,{children:"true"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"LRS"}),e.jsx(n.td,{children:"Long Region Server Name"}),e.jsx(n.td,{children:"false"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"#REGION"}),e.jsx(n.td,{children:"Region Count"}),e.jsx(n.td,{children:"true"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"#REQ/S"}),e.jsx(n.td,{children:"Request Count per second"}),e.jsx(n.td,{children:"true"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"#READ/S"}),e.jsx(n.td,{children:"Read Request Count per second"}),e.jsx(n.td,{children:"true"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"#FREAD/S"}),e.jsx(n.td,{children:"Filtered Read Request Count per second"}),e.jsx(n.td,{children:"true"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"#WRITE/S"}),e.jsx(n.td,{children:"Write Request Count per second"}),e.jsx(n.td,{children:"true"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"SF"}),e.jsx(n.td,{children:"StoreFile Size"}),e.jsx(n.td,{children:"true"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"USF"}),e.jsx(n.td,{children:"Uncompressed StoreFile Size"}),e.jsx(n.td,{children:"false"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"#SF"}),e.jsx(n.td,{children:"Number of StoreFiles"}),e.jsx(n.td,{children:"true"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"MEMSTORE"}),e.jsx(n.td,{children:"MemStore Size"}),e.jsx(n.td,{children:"true"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"UHEAP"}),e.jsx(n.td,{children:"Used Heap Size"}),e.jsx(n.td,{children:"true"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"MHEAP"}),e.jsx(n.td,{children:"Max Heap Size"}),e.jsx(n.td,{children:"true"})]})]})]}),`
`,e.jsx(n.h4,{id:"user-mode",children:"User mode"}),`
`,e.jsxs(n.p,{children:["In User mode, the default sort field is ",e.jsx(n.code,{children:"#REQ/S"}),"."]}),`
`,e.jsx(n.p,{children:"The fields in this mode are as follows:"}),`
`,e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Field"}),e.jsx(n.th,{children:"Description"}),e.jsx(n.th,{children:"Displayed by default"})]})}),e.jsxs(n.tbody,{children:[e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"USER"}),e.jsx(n.td,{children:"user Name"}),e.jsx(n.td,{children:"true"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"#CLIENT"}),e.jsx(n.td,{children:"Client Count"}),e.jsx(n.td,{children:"true"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"#REQ/S"}),e.jsx(n.td,{children:"Request Count per second"}),e.jsx(n.td,{children:"true"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"#READ/S"}),e.jsx(n.td,{children:"Read Request Count per second"}),e.jsx(n.td,{children:"true"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"#WRITE/S"}),e.jsx(n.td,{children:"Write Request Count per second"}),e.jsx(n.td,{children:"true"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"#FREAD/S"}),e.jsx(n.td,{children:"Filtered Read Request Count per second"}),e.jsx(n.td,{children:"true"})]})]})]}),`
`,e.jsx(n.h4,{id:"client-mode",children:"Client mode"}),`
`,e.jsxs(n.p,{children:["In Client mode, the default sort field is ",e.jsx(n.code,{children:"#REQ/S"}),"."]}),`
`,e.jsx(n.p,{children:"The fields in this mode are as follows:"}),`
`,e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Field"}),e.jsx(n.th,{children:"Description"}),e.jsx(n.th,{children:"Displayed by default"})]})}),e.jsxs(n.tbody,{children:[e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"CLIENT"}),e.jsx(n.td,{children:"Client Hostname"}),e.jsx(n.td,{children:"true"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"#USER"}),e.jsx(n.td,{children:"User Count"}),e.jsx(n.td,{children:"true"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"#REQ/S"}),e.jsx(n.td,{children:"Request Count per second"}),e.jsx(n.td,{children:"true"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"#READ/S"}),e.jsx(n.td,{children:"Read Request Count per second"}),e.jsx(n.td,{children:"true"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"#WRITE/S"}),e.jsx(n.td,{children:"Write Request Count per second"}),e.jsx(n.td,{children:"true"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"#FREAD/S"}),e.jsx(n.td,{children:"Filtered Read Request Count per second"}),e.jsx(n.td,{children:"true"})]})]})]}),`
`,e.jsx(n.h3,{id:"changing-mode",children:"Changing mode"}),`
`,e.jsxs(n.p,{children:["You can change mode by pressing ",e.jsx(n.code,{children:"m"})," key in the top screen."]}),`
`,e.jsx(n.p,{children:e.jsx(n.img,{alt:"Changing mode",src:s})}),`
`,e.jsx(n.h3,{id:"changing-the-refresh-delay",children:"Changing the refresh delay"}),`
`,e.jsxs(n.p,{children:["You can change the refresh by pressing ",e.jsx(n.code,{children:"d"})," key in the top screen."]}),`
`,e.jsx(n.p,{children:e.jsx(n.img,{alt:"Changing the refresh delay",src:o})}),`
`,e.jsx(n.h3,{id:"changing-the-displayed-fields",children:"Changing the displayed fields"}),`
`,e.jsxs(n.p,{children:["You can move to the field screen by pressing ",e.jsx(n.code,{children:"f"})," key in the top screen. In the fields screen, you can change the displayed fields by choosing a field and pressing ",e.jsx(n.code,{children:"d"})," key or ",e.jsx(n.code,{children:"space"})," key."]}),`
`,e.jsx(n.p,{children:e.jsx(n.img,{alt:"Changing the displayed fields",src:c})}),`
`,e.jsx(n.h3,{id:"changing-the-sort-field",children:"Changing the sort field"}),`
`,e.jsxs(n.p,{children:["You can move to the fields screen by pressing ",e.jsx(n.code,{children:"f"})," key in the top screen. In the field screen, you can change the sort field by choosing a field and pressing ",e.jsx(n.code,{children:"s"}),". Also, you can change the sort order (ascending or descending) by pressing ",e.jsx(n.code,{children:"R"})," key."]}),`
`,e.jsx(n.p,{children:e.jsx(n.img,{alt:"Changing the sort field",src:h})}),`
`,e.jsx(n.h3,{id:"changing-the-order-of-the-fields",children:"Changing the order of the fields"}),`
`,e.jsxs(n.p,{children:["You can move to the fields screen by pressing ",e.jsx(n.code,{children:"f"})," key in the top screen. In the field screen, you can change the order of the fields."]}),`
`,e.jsx(n.p,{children:e.jsx(n.img,{alt:"Changing the sort field",src:l})}),`
`,e.jsx(n.h3,{id:"filters",children:"Filters"}),`
`,e.jsxs(n.p,{children:["You can filter the metric records with the filter feature. We can add filters by pressing ",e.jsx(n.code,{children:"o"})," key for ignoring case or ",e.jsx(n.code,{children:"O"})," key for case sensitive."]}),`
`,e.jsx(n.p,{children:e.jsx(n.img,{alt:"Adding filters",src:a})}),`
`,e.jsx(n.p,{children:"The syntax is as follows:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"<Field><Operator><Value>"})})})})}),`
`,e.jsx(n.p,{children:"For example, we can add filters like the following:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"NAMESPACE==default"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"REQ/S>1000"})})]})})}),`
`,e.jsx(n.p,{children:"The operators we can specify are as follows:"}),`
`,e.jsxs(n.table,{children:[e.jsx(n.thead,{children:e.jsxs(n.tr,{children:[e.jsx(n.th,{children:"Operator"}),e.jsx(n.th,{children:"Description"})]})}),e.jsxs(n.tbody,{children:[e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"="}),e.jsx(n.td,{children:"Partial match"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"=="}),e.jsx(n.td,{children:"Exact match"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:">"}),e.jsx(n.td,{children:"Greater than"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:">="}),e.jsx(n.td,{children:"Greater than or equal to"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"<"}),e.jsx(n.td,{children:"Less than"})]}),e.jsxs(n.tr,{children:[e.jsx(n.td,{children:"<="}),e.jsx(n.td,{children:"Less than and equal to"})]})]})]}),`
`,e.jsxs(n.p,{children:["You can see the current filters by pressing ",e.jsx(n.code,{children:"^o"})," key and clear them by pressing ",e.jsx(n.code,{children:"="})," key."]}),`
`,e.jsx(n.p,{children:e.jsx(n.img,{alt:"Showing and clearing filters",src:g})}),`
`,e.jsx(n.h3,{id:"drilling-down",children:"Drilling down"}),`
`,e.jsxs(n.p,{children:["You can drill down the metric record by choosing a metric record that you want to drill down and pressing ",e.jsx(n.code,{children:"i"})," key in the top screen. With this feature, you can find hot regions easily in a top-down manner."]}),`
`,e.jsx(n.p,{children:e.jsx(n.img,{alt:"Drilling down",src:m})}),`
`,e.jsx(n.h3,{id:"help-screen",children:"Help screen"}),`
`,e.jsxs(n.p,{children:["You can see the help screen by pressing ",e.jsx(n.code,{children:"h"})," key in the top screen."]}),`
`,e.jsx(n.p,{children:e.jsx(n.img,{alt:"Help screen",src:u})}),`
`,e.jsx(n.h2,{id:"hbtop-others",children:"Others"}),`
`,e.jsx(n.h3,{id:"how-hbtop-gets-the-metrics-data",children:"How hbtop gets the metrics data"}),`
`,e.jsx(n.p,{children:"hbtop gets the metrics from ClusterMetrics which is returned as the result of a call to Admin#getClusterMetrics() on the current HMaster. To add metrics to hbtop, they will need to be exposed via ClusterMetrics."})]})}function y(t={}){const{wrapper:n}=t.components||{};return n?e.jsx(n,{...t,children:e.jsx(i,{...t})}):i(t)}export{j as _markdown,y as default,S as extractedReferences,f as frontmatter,R as structuredData,b as toc};
