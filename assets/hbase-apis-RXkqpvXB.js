import{j as i}from"./chunk-QUQL4437-Bywy9pC_.js";let l=`This information is not exhaustive, and provides a quick reference in addition to the [User API Reference](https://hbase.apache.org/apidocs/index.html).
The examples here are not comprehensive or complete, and should be used for purposes of illustration only.

Apache HBase also works with multiple external APIs.
See [Apache HBase External APIs](/docs/external-apis) for more information.

## Examples

### Create, modify and delete a Table Using Java

\`\`\`java
package com.example.hbase.admin;

import java.io.IOException;

import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.fs.Path;
import org.apache.hadoop.hbase.HBaseConfiguration;
import org.apache.hadoop.hbase.HColumnDescriptor;
import org.apache.hadoop.hbase.HConstants;
import org.apache.hadoop.hbase.HTableDescriptor;
import org.apache.hadoop.hbase.TableName;
import org.apache.hadoop.hbase.client.Admin;
import org.apache.hadoop.hbase.client.Connection;
import org.apache.hadoop.hbase.client.ConnectionFactory;
import org.apache.hadoop.hbase.io.compress.Compression.Algorithm;

public class Example {

  private static final String TABLE_NAME = "MY_TABLE_NAME_TOO";
  private static final String CF_DEFAULT = "DEFAULT_COLUMN_FAMILY";

  public static void createOrOverwrite(Admin admin, HTableDescriptor table) throws IOException {
    if (admin.tableExists(table.getTableName())) {
      admin.disableTable(table.getTableName());
      admin.deleteTable(table.getTableName());
    }
    admin.createTable(table);
  }

  public static void createSchemaTables(Configuration config) throws IOException {
    try (Connection connection = ConnectionFactory.createConnection(config);
         Admin admin = connection.getAdmin()) {

      HTableDescriptor table = new HTableDescriptor(TableName.valueOf(TABLE_NAME));
      table.addFamily(new HColumnDescriptor(CF_DEFAULT).setCompressionType(Algorithm.NONE));

      System.out.print("Creating table. ");
      createOrOverwrite(admin, table);
      System.out.println(" Done.");
    }
  }

  public static void modifySchema (Configuration config) throws IOException {
    try (Connection connection = ConnectionFactory.createConnection(config);
         Admin admin = connection.getAdmin()) {

      TableName tableName = TableName.valueOf(TABLE_NAME);
      if (!admin.tableExists(tableName)) {
        System.out.println("Table does not exist.");
        System.exit(-1);
      }

      HTableDescriptor table = admin.getTableDescriptor(tableName);

      // Update existing table
      HColumnDescriptor newColumn = new HColumnDescriptor("NEWCF");
      newColumn.setCompactionCompressionType(Algorithm.GZ);
      newColumn.setMaxVersions(HConstants.ALL_VERSIONS);
      admin.addColumn(tableName, newColumn);

      // Update existing column family
      HColumnDescriptor existingColumn = new HColumnDescriptor(CF_DEFAULT);
      existingColumn.setCompactionCompressionType(Algorithm.GZ);
      existingColumn.setMaxVersions(HConstants.ALL_VERSIONS);
      table.modifyFamily(existingColumn);
      admin.modifyTable(tableName, table);

      // Disable an existing table
      admin.disableTable(tableName);

      // Delete an existing column family
      admin.deleteColumn(tableName, CF_DEFAULT.getBytes("UTF-8"));

      // Delete a table (Need to be disabled first)
      admin.deleteTable(tableName);
    }
  }

  public static void main(String... args) throws IOException {
    Configuration config = HBaseConfiguration.create();

    //Add any necessary configuration files (hbase-site.xml, core-site.xml)
    config.addResource(new Path(System.getenv("HBASE_CONF_DIR"), "hbase-site.xml"));
    config.addResource(new Path(System.getenv("HADOOP_CONF_DIR"), "core-site.xml"));
    createSchemaTables(config);
    modifySchema(config);
  }
}
\`\`\`
`,h={title:"Apache HBase APIs",description:"This chapter provides information about performing operations using HBase native APIs."},t=[{href:"https://hbase.apache.org/apidocs/index.html"},{href:"/docs/external-apis"}],r={contents:[{heading:void 0,content:`This information is not exhaustive, and provides a quick reference in addition to the User API Reference.
The examples here are not comprehensive or complete, and should be used for purposes of illustration only.`},{heading:void 0,content:`Apache HBase also works with multiple external APIs.
See Apache HBase External APIs for more information.`}],headings:[{id:"hbase-apis-examples",content:"Examples"},{id:"create-modify-and-delete-a-table-using-java",content:"Create, modify and delete a Table Using Java"}]};const k=[{depth:2,url:"#hbase-apis-examples",title:i.jsx(i.Fragment,{children:"Examples"})},{depth:3,url:"#create-modify-and-delete-a-table-using-java",title:i.jsx(i.Fragment,{children:"Create, modify and delete a Table Using Java"})}];function n(e){const s={a:"a",code:"code",h2:"h2",h3:"h3",p:"p",pre:"pre",span:"span",...e.components};return i.jsxs(i.Fragment,{children:[i.jsxs(s.p,{children:["This information is not exhaustive, and provides a quick reference in addition to the ",i.jsx(s.a,{href:"https://hbase.apache.org/apidocs/index.html",children:"User API Reference"}),`.
The examples here are not comprehensive or complete, and should be used for purposes of illustration only.`]}),`
`,i.jsxs(s.p,{children:[`Apache HBase also works with multiple external APIs.
See `,i.jsx(s.a,{href:"/docs/external-apis",children:"Apache HBase External APIs"})," for more information."]}),`
`,i.jsx(s.h2,{id:"hbase-apis-examples",children:"Examples"}),`
`,i.jsx(s.h3,{id:"create-modify-and-delete-a-table-using-java",children:"Create, modify and delete a Table Using Java"}),`
`,i.jsx(i.Fragment,{children:i.jsx(s.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:i.jsxs(s.code,{children:[i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"package"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" com.example.hbase.admin;"})]}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" java.io.IOException;"})]}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" org.apache.hadoop.conf.Configuration;"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" org.apache.hadoop.fs.Path;"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" org.apache.hadoop.hbase.HBaseConfiguration;"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" org.apache.hadoop.hbase.HColumnDescriptor;"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" org.apache.hadoop.hbase.HConstants;"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" org.apache.hadoop.hbase.HTableDescriptor;"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" org.apache.hadoop.hbase.TableName;"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" org.apache.hadoop.hbase.client.Admin;"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" org.apache.hadoop.hbase.client.Connection;"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" org.apache.hadoop.hbase.client.ConnectionFactory;"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"import"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" org.apache.hadoop.hbase.io.compress.Compression.Algorithm;"})]}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"public"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" class"}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Example"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" {"})]}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  private"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" static"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" final"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" String TABLE_NAME "}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "MY_TABLE_NAME_TOO"'}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  private"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" static"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" final"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" String CF_DEFAULT "}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:' "DEFAULT_COLUMN_FAMILY"'}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  public"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" static"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" void"}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" createOrOverwrite"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(Admin "}),i.jsx(s.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"admin"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", HTableDescriptor "}),i.jsx(s.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"table"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"throws"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" IOException {"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    if"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (admin."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"tableExists"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(table."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getTableName"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"())) {"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      admin."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"disableTable"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(table."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getTableName"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"());"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      admin."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"deleteTable"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(table."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getTableName"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"());"})]}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    admin."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"createTable"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(table);"})]}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  public"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" static"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" void"}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" createSchemaTables"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(Configuration "}),i.jsx(s.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"config"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"throws"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" IOException {"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    try"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (Connection connection "}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ConnectionFactory."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"createConnection"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(config);"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"         Admin admin "}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" connection."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getAdmin"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()) {"})]}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      HTableDescriptor table "}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" HTableDescriptor"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(TableName."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"valueOf"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(TABLE_NAME));"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      table."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"addFamily"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"new"}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" HColumnDescriptor"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(CF_DEFAULT)."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"setCompressionType"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(Algorithm.NONE));"})]}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      System.out."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"print"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Creating table. "'}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"      createOrOverwrite"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(admin, table);"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      System.out."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"println"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'" Done."'}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  public"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" static"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" void"}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" modifySchema"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (Configuration "}),i.jsx(s.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"config"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"throws"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" IOException {"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"    try"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" (Connection connection "}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ConnectionFactory."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"createConnection"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(config);"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"         Admin admin "}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" connection."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getAdmin"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"()) {"})]}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      TableName tableName "}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" TableName."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"valueOf"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(TABLE_NAME);"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"      if"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ("}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"!"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"admin."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"tableExists"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(tableName)) {"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        System.out."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"println"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"Table does not exist."'}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"        System."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"exit"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"-"}),i.jsx(s.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      }"})}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      HTableDescriptor table "}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" admin."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getTableDescriptor"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(tableName);"})]}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"      // Update existing table"})}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      HColumnDescriptor newColumn "}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" HColumnDescriptor"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"NEWCF"'}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      newColumn."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"setCompactionCompressionType"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(Algorithm.GZ);"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      newColumn."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"setMaxVersions"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(HConstants.ALL_VERSIONS);"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      admin."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"addColumn"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(tableName, newColumn);"})]}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"      // Update existing column family"})}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      HColumnDescriptor existingColumn "}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" HColumnDescriptor"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(CF_DEFAULT);"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      existingColumn."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"setCompactionCompressionType"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(Algorithm.GZ);"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      existingColumn."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"setMaxVersions"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(HConstants.ALL_VERSIONS);"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      table."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"modifyFamily"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(existingColumn);"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      admin."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"modifyTable"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(tableName, table);"})]}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"      // Disable an existing table"})}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      admin."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"disableTable"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(tableName);"})]}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"      // Delete an existing column family"})}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      admin."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"deleteColumn"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(tableName, CF_DEFAULT."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getBytes"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"UTF-8"'}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"));"})]}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"      // Delete a table (Need to be disabled first)"})}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"      admin."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"deleteTable"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(tableName);"})]}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    }"})}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  public"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" static"}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" void"}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" main"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(String... "}),i.jsx(s.span,{style:{"--shiki-light":"#E36209","--shiki-dark":"#FFAB70"},children:"args"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:") "}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"throws"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" IOException {"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    Configuration config "}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" HBaseConfiguration."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"create"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,i.jsx(s.span,{className:"line"}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#6A737D","--shiki-dark":"#6A737D"},children:"    //Add any necessary configuration files (hbase-site.xml, core-site.xml)"})}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    config."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"addResource"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"new"}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Path"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(System."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getenv"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"HBASE_CONF_DIR"'}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"), "}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"hbase-site.xml"'}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"));"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    config."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"addResource"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(s.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"new"}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" Path"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(System."}),i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getenv"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"HADOOP_CONF_DIR"'}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"), "}),i.jsx(s.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"core-site.xml"'}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"));"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"    createSchemaTables"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(config);"})]}),`
`,i.jsxs(s.span,{className:"line",children:[i.jsx(s.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"    modifySchema"}),i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"(config);"})]}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,i.jsx(s.span,{className:"line",children:i.jsx(s.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})})]})}function d(e={}){const{wrapper:s}=e.components||{};return s?i.jsx(s,{...e,children:i.jsx(n,{...e})}):n(e)}export{l as _markdown,d as default,t as extractedReferences,h as frontmatter,r as structuredData,k as toc};
