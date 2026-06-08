import{j as e}from"./chunk-QUQL4437-Bywy9pC_.js";let r=`This chapter expands upon the [Getting Started](/docs/getting-started) chapter to further explain configuration of Apache HBase. Please read this chapter carefully, especially the [Basic Prerequisites](/docs/configuration/basic-prerequisites) to ensure that your HBase testing and deployment goes smoothly. Familiarize yourself with [Support and Testing Expectations](/docs#support-and-testing-expectations) as well.

## Configuration Files

Apache HBase uses the same configuration system as Apache Hadoop. All configuration files are located in the *conf/* directory, which needs to be kept in sync for each node on your cluster.

***backup-masters***\\
Not present by default. A plain-text file which lists hosts on which the Master should start a backup Master process, one host per line.

***hadoop-metrics2-hbase.properties***\\
Used to connect HBase Hadoop's Metrics2 framework. See the [Hadoop Wiki entry](https://cwiki.apache.org/confluence/display/HADOOP2/HADOOP-6728-MetricsV2) for more information on Metrics2. Contains only commented-out examples by default.

***hbase-env.cmd* and *hbase-env.sh***\\
Script for Windows and Linux / Unix environments to set up the working environment for HBase, including the location of Java, Java options, and other environment variables. The file contains many commented-out examples to provide guidance.

***hbase-policy.xml***\\
The default policy configuration file used by RPC servers to make authorization decisions on client requests. Only used if HBase [security](/docs/security) is enabled.

***hbase-site.xml***\\
The main HBase configuration file. This file specifies configuration options which override HBase's default configuration. You can view (but do not edit) the default configuration file at *hbase-common/src/main/resources/hbase-default.xml*. You can also view the entire effective configuration for your cluster (defaults and overrides) in the **HBase Configuration** tab of the HBase Web UI.

***log4j2.properties***\\
Configuration file for HBase logging via \`log4j2\`.

***regionservers***\\
A plain-text file containing a list of hosts which should run a RegionServer in your HBase cluster. By default, this file contains the single entry \`localhost\`. It should contain a list of hostnames or IP addresses, one per line, and should only contain \`localhost\` if each node in your cluster will run a RegionServer on its \`localhost\` interface.

<Callout type="tip">
  When you edit XML, it is a good idea to use an XML-aware editor to be sure that your syntax is
  correct and your XML is well-formed. You can also use the \`xmllint\` utility to check that your XML
  is well-formed. By default, \`xmllint\` re-flows and prints the XML to standard output. To check for
  well-formedness and only print output if errors exist, use the command \`xmllint -noout
    filename.xml\`.
</Callout>

<Callout type="warn">
  When running in distributed mode, after you make an edit to an HBase configuration, make sure you
  copy the contents of the *conf/* directory to all nodes of the cluster. HBase will not do this for
  you. Use a configuration management tool for managing and copying the configuration files to your
  nodes. For most configurations, a restart is needed for servers to pick up changes. Dynamic
  configuration is an exception to this, to be described later below.
</Callout>
`,c={title:"Configuration",description:"Complete guide to HBase configuration including all settings, tuning parameters, and best practices."},l=[{href:"/docs/getting-started"},{href:"/docs/configuration/basic-prerequisites"},{href:"/docs#support-and-testing-expectations"},{href:"https://cwiki.apache.org/confluence/display/HADOOP2/HADOOP-6728-MetricsV2"},{href:"/docs/security"}],d={contents:[{heading:void 0,content:"This chapter expands upon the Getting Started chapter to further explain configuration of Apache HBase. Please read this chapter carefully, especially the Basic Prerequisites to ensure that your HBase testing and deployment goes smoothly. Familiarize yourself with Support and Testing Expectations as well."},{heading:"configuration-files",content:"Apache HBase uses the same configuration system as Apache Hadoop. All configuration files are located in the conf/ directory, which needs to be kept in sync for each node on your cluster."},{heading:"configuration-files",content:"backup-mastersNot present by default. A plain-text file which lists hosts on which the Master should start a backup Master process, one host per line."},{heading:"configuration-files",content:"hadoop-metrics2-hbase.propertiesUsed to connect HBase Hadoop's Metrics2 framework. See the Hadoop Wiki entry for more information on Metrics2. Contains only commented-out examples by default."},{heading:"configuration-files",content:"hbase-env.cmd and hbase-env.shScript for Windows and Linux / Unix environments to set up the working environment for HBase, including the location of Java, Java options, and other environment variables. The file contains many commented-out examples to provide guidance."},{heading:"configuration-files",content:"hbase-policy.xmlThe default policy configuration file used by RPC servers to make authorization decisions on client requests. Only used if HBase security is enabled."},{heading:"configuration-files",content:"hbase-site.xmlThe main HBase configuration file. This file specifies configuration options which override HBase's default configuration. You can view (but do not edit) the default configuration file at hbase-common/src/main/resources/hbase-default.xml. You can also view the entire effective configuration for your cluster (defaults and overrides) in the HBase Configuration tab of the HBase Web UI."},{heading:"configuration-files",content:"log4j2.propertiesConfiguration file for HBase logging via log4j2."},{heading:"configuration-files",content:"regionserversA plain-text file containing a list of hosts which should run a RegionServer in your HBase cluster. By default, this file contains the single entry localhost. It should contain a list of hostnames or IP addresses, one per line, and should only contain localhost if each node in your cluster will run a RegionServer on its localhost interface."},{heading:"configuration-files",content:"type: tip"},{heading:"configuration-files",content:`When you edit XML, it is a good idea to use an XML-aware editor to be sure that your syntax is
correct and your XML is well-formed. You can also use the xmllint utility to check that your XML
is well-formed. By default, xmllint re-flows and prints the XML to standard output. To check for
well-formedness and only print output if errors exist, use the command xmllint -noout
  filename.xml.`},{heading:"configuration-files",content:"type: warn"},{heading:"configuration-files",content:`When running in distributed mode, after you make an edit to an HBase configuration, make sure you
copy the contents of the conf/ directory to all nodes of the cluster. HBase will not do this for
you. Use a configuration management tool for managing and copying the configuration files to your
nodes. For most configurations, a restart is needed for servers to pick up changes. Dynamic
configuration is an exception to this, to be described later below.`}],headings:[{id:"configuration-files",content:"Configuration Files"}]};const u=[{depth:2,url:"#configuration-files",title:e.jsx(e.Fragment,{children:"Configuration Files"})}];function i(o){const n={a:"a",br:"br",code:"code",em:"em",h2:"h2",p:"p",strong:"strong",...o.components},{Callout:t}=n;return t||s("Callout"),e.jsxs(e.Fragment,{children:[e.jsxs(n.p,{children:["This chapter expands upon the ",e.jsx(n.a,{href:"/docs/getting-started",children:"Getting Started"})," chapter to further explain configuration of Apache HBase. Please read this chapter carefully, especially the ",e.jsx(n.a,{href:"/docs/configuration/basic-prerequisites",children:"Basic Prerequisites"})," to ensure that your HBase testing and deployment goes smoothly. Familiarize yourself with ",e.jsx(n.a,{href:"/docs#support-and-testing-expectations",children:"Support and Testing Expectations"})," as well."]}),`
`,e.jsx(n.h2,{id:"configuration-files",children:"Configuration Files"}),`
`,e.jsxs(n.p,{children:["Apache HBase uses the same configuration system as Apache Hadoop. All configuration files are located in the ",e.jsx(n.em,{children:"conf/"})," directory, which needs to be kept in sync for each node on your cluster."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:e.jsx(n.em,{children:"backup-masters"})}),e.jsx(n.br,{}),`
`,"Not present by default. A plain-text file which lists hosts on which the Master should start a backup Master process, one host per line."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:e.jsx(n.em,{children:"hadoop-metrics2-hbase.properties"})}),e.jsx(n.br,{}),`
`,"Used to connect HBase Hadoop's Metrics2 framework. See the ",e.jsx(n.a,{href:"https://cwiki.apache.org/confluence/display/HADOOP2/HADOOP-6728-MetricsV2",children:"Hadoop Wiki entry"})," for more information on Metrics2. Contains only commented-out examples by default."]}),`
`,e.jsxs(n.p,{children:[e.jsxs(n.strong,{children:[e.jsx(n.em,{children:"hbase-env.cmd"})," and ",e.jsx(n.em,{children:"hbase-env.sh"})]}),e.jsx(n.br,{}),`
`,"Script for Windows and Linux / Unix environments to set up the working environment for HBase, including the location of Java, Java options, and other environment variables. The file contains many commented-out examples to provide guidance."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:e.jsx(n.em,{children:"hbase-policy.xml"})}),e.jsx(n.br,{}),`
`,"The default policy configuration file used by RPC servers to make authorization decisions on client requests. Only used if HBase ",e.jsx(n.a,{href:"/docs/security",children:"security"})," is enabled."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:e.jsx(n.em,{children:"hbase-site.xml"})}),e.jsx(n.br,{}),`
`,"The main HBase configuration file. This file specifies configuration options which override HBase's default configuration. You can view (but do not edit) the default configuration file at ",e.jsx(n.em,{children:"hbase-common/src/main/resources/hbase-default.xml"}),". You can also view the entire effective configuration for your cluster (defaults and overrides) in the ",e.jsx(n.strong,{children:"HBase Configuration"})," tab of the HBase Web UI."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:e.jsx(n.em,{children:"log4j2.properties"})}),e.jsx(n.br,{}),`
`,"Configuration file for HBase logging via ",e.jsx(n.code,{children:"log4j2"}),"."]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:e.jsx(n.em,{children:"regionservers"})}),e.jsx(n.br,{}),`
`,"A plain-text file containing a list of hosts which should run a RegionServer in your HBase cluster. By default, this file contains the single entry ",e.jsx(n.code,{children:"localhost"}),". It should contain a list of hostnames or IP addresses, one per line, and should only contain ",e.jsx(n.code,{children:"localhost"})," if each node in your cluster will run a RegionServer on its ",e.jsx(n.code,{children:"localhost"})," interface."]}),`
`,e.jsx(t,{type:"tip",children:e.jsxs(n.p,{children:[`When you edit XML, it is a good idea to use an XML-aware editor to be sure that your syntax is
correct and your XML is well-formed. You can also use the `,e.jsx(n.code,{children:"xmllint"}),` utility to check that your XML
is well-formed. By default, `,e.jsx(n.code,{children:"xmllint"}),` re-flows and prints the XML to standard output. To check for
well-formedness and only print output if errors exist, use the command `,e.jsx(n.code,{children:"xmllint -noout   filename.xml"}),"."]})}),`
`,e.jsx(t,{type:"warn",children:e.jsxs(n.p,{children:[`When running in distributed mode, after you make an edit to an HBase configuration, make sure you
copy the contents of the `,e.jsx(n.em,{children:"conf/"}),` directory to all nodes of the cluster. HBase will not do this for
you. Use a configuration management tool for managing and copying the configuration files to your
nodes. For most configurations, a restart is needed for servers to pick up changes. Dynamic
configuration is an exception to this, to be described later below.`]})})]})}function h(o={}){const{wrapper:n}=o.components||{};return n?e.jsx(n,{...o,children:e.jsx(i,{...o})}):i(o)}function s(o,n){throw new Error("Expected component `"+o+"` to be defined: you likely forgot to import, pass, or provide it.")}export{r as _markdown,h as default,l as extractedReferences,c as frontmatter,d as structuredData,u as toc};
