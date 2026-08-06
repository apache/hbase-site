import{j as e}from"./components-BCHf_v1I.js";let a=`You can configure [Thrift](https://thrift.apache.org/) for secure authentication at the server and client side, by following the procedures in [Client-side Configuration for Secure Operation - Thrift Gateway](/docs/security/client-access#client-side-configuration-for-secure-operation---thrift-gateway) and [Configure the Thrift Gateway to Authenticate on Behalf of the Client](/docs/security/client-access#configure-the-thrift-gateway-to-authenticate-on-behalf-of-the-client).

The rest of this chapter discusses the filter language provided by the Thrift API.

## Filter Language

Thrift Filter Language was introduced in HBase 0.92.
It allows you to perform server-side filtering when accessing HBase over Thrift or in the HBase shell.
You can find out more about shell integration by using the \`scan help\` command in the shell.

You specify a filter as a string, which is parsed on the server to construct the filter.

### General Filter String Syntax

A simple filter expression is expressed as a string:

\`\`\`text
"FilterName (argument, argument,... , argument)"
\`\`\`

Keep the following syntax guidelines in mind.

* Specify the name of the filter followed by the comma-separated argument list in parentheses.
* If the argument represents a string, it should be enclosed in single quotes (\`'\`).
* Arguments which represent a boolean, an integer, or a comparison operator (such as \`<\`, \`>\`, or \`!=\`), should not be enclosed in quotes
* The filter name must be a single word.
  All ASCII characters are allowed except for whitespace, single quotes and parentheses.
* The filter's arguments can contain any ASCII character.
  If single quotes are present in the argument, they must be escaped by an additional preceding single quote.

### Compound Filters and Operators

#### Binary Operators

**\`AND\`**\\
If the \`AND\` operator is used, the key-value must satisfy both filters.

**\`OR\`**\\
If the \`OR\` operator is used, the key-value must satisfy at least one of the filters.

#### Unary Operators

**\`SKIP\`**\\
For a particular row, if any of the key-values fail the filter condition, the entire row is skipped.

**\`WHILE\`**\\
For a particular row, key-values will be emitted until a key-value is reached that fails the filter condition.

#### Compound Operators

You can combine multiple operators to create a hierarchy of filters, such as the following example:

\`\`\`text
(Filter1 AND Filter2) OR (Filter3 AND Filter4)
\`\`\`

### Order of Evaluation

1. Parentheses have the highest precedence.
2. The unary operators \`SKIP\` and \`WHILE\` are next, and have the same precedence.
3. The binary operators follow. \`AND\` has highest precedence, followed by \`OR\`.

#### Precedence Example

\`\`\`text
Filter1 AND Filter2 OR Filter
is evaluated as
(Filter1 AND Filter2) OR Filter3
\`\`\`

\`\`\`text
Filter1 AND SKIP Filter2 OR Filter3
is evaluated as
(Filter1 AND (SKIP Filter2)) OR Filter3
\`\`\`

You can use parentheses to explicitly control the order of evaluation.

### Compare Operator

The following compare operators are provided:

1. LESS (\`<\`)
2. LESS\\_OR\\_EQUAL (\`<=\`)
3. EQUAL (\`=\`)
4. NOT\\_EQUAL (\`!=\`)
5. GREATER\\_OR\\_EQUAL (\`>=\`)
6. GREATER (\`>\`)
7. NO\\_OP (no operation)

The client should use the symbols (\`<\`, \`<=\`, \`=\`, \`!=\`, \`>\`, \`>=\`) to express compare operators.

### Comparator

A comparator can be any of the following:

1. *BinaryComparator* - This lexicographically compares against the specified byte array using Bytes.compareTo(byte\\[], byte\\[])
2. *BinaryPrefixComparator* - This lexicographically compares against a specified byte array.
   It only compares up to the length of this byte array.
3. *RegexStringComparator* - This compares against the specified byte array using the given regular expression.
   Only EQUAL and NOT\\_EQUAL comparisons are valid with this comparator
4. *SubStringComparator* - This tests if the given substring appears in a specified byte array.
   The comparison is case insensitive.
   Only EQUAL and NOT\\_EQUAL comparisons are valid with this comparator

The general syntax of a comparator is: \`ComparatorType:ComparatorValue\`

The ComparatorType for the various comparators is as follows:

1. *BinaryComparator* - binary
2. *BinaryPrefixComparator* - binaryprefix
3. *RegexStringComparator* - regexstring
4. *SubStringComparator* - substring

The ComparatorValue can be any value.

#### Example ComparatorValues

1. \`binary:abc\` will match everything that is lexicographically greater than "abc"
2. \`binaryprefix:abc\` will match everything whose first 3 characters are lexicographically equal to "abc"
3. \`regexstring:ab*yz\` will match everything that doesn't begin with "ab" and ends with "yz"
4. \`substring:abc123\` will match everything that begins with the substring "abc123"

### Example PHP Client Program that uses the Filter Language

\`\`\`php
<?
  $_SERVER['PHP_ROOT'] = realpath(dirname(__FILE__).'/..');
  require_once $_SERVER['PHP_ROOT'].'/flib/__flib.php';
  flib_init(FLIB_CONTEXT_SCRIPT);
  require_module('storage/hbase');
  $hbase = new HBase('<server_name_running_thrift_server>', <port on which thrift server is running>);
  $hbase->open();
  $client = $hbase->getClient();
  $result = $client->scannerOpenWithFilterString('table_name', "(PrefixFilter ('row2') AND (QualifierFilter (>=, 'binary:xyz'))) AND (TimestampsFilter ( 123, 456))");
  $to_print = $client->scannerGetList($result,1);
  while ($to_print) {
    print_r($to_print);
    $to_print = $client->scannerGetList($result,1);
  }
  $client->scannerClose($result);
?>
\`\`\`

### Example Filter Strings

* \`"PrefixFilter ('Row') AND PageFilter (1) AND FirstKeyOnlyFilter ()"\` will return all key-value pairs that match the following conditions:
  1. The row containing the key-value should have prefix *Row*
  2. The key-value must be located in the first row of the table
  3. The key-value pair must be the first key-value in the row
* \`"(RowFilter (=, 'binary:Row 1') AND TimeStampsFilter (74689, 89734)) OR ColumnRangeFilter ('abc', true, 'xyz', false))"\` will return all key-value pairs that match both the following conditions:
  * The key-value is in a row having row key *Row 1*
  * The key-value must have a timestamp of either 74689 or 89734.
  * Or it must match the following condition:
    * The key-value pair must be in a column that is lexicographically >= abc and \\< xyz
* \`"SKIP ValueFilter (0)"\` will skip the entire row if any of the values in the row is not 0

### Individual Filter Syntax

**KeyOnlyFilter**\\
This filter doesn't take any arguments.
It returns only the key component of each key-value.

**FirstKeyOnlyFilter**\\
This filter doesn't take any arguments.
It returns only the first key-value from each row.

**PrefixFilter**\\
This filter takes one argument – a prefix of a row key.
It returns only those key-values present in a row that starts with the specified row prefix

**ColumnPrefixFilter**\\
This filter takes one argument – a column prefix.
It returns only those key-values present in a column that starts with the specified column prefix.
The column prefix must be of the form: \`"qualifier"\`.

**MultipleColumnPrefixFilter**\\
This filter takes a list of column prefixes.
It returns key-values that are present in a column that starts with any of the specified column prefixes.
Each of the column prefixes must be of the form: \`"qualifier"\`.

**ColumnCountGetFilter**\\
This filter takes one argument – a limit.
It returns the first limit number of columns in the table.

**PageFilter**\\
This filter takes one argument – a page size.
It returns page size number of rows from the table.

**ColumnPaginationFilter**\\
This filter takes two arguments – a limit and offset.
It returns limit number of columns after offset number of columns.
It does this for all the rows.

**InclusiveStopFilter**\\
This filter takes one argument – a row key on which to stop scanning.
It returns all key-values present in rows up to and including the specified row.

**TimeStampsFilter**\\
This filter takes a list of timestamps.
It returns those key-values whose timestamps matches any of the specified timestamps.

**RowFilter**\\
This filter takes a compare operator and a comparator.
It compares each row key with the comparator using the compare operator and if the comparison returns true, it returns all the key-values in that row.

**Family Filter**\\
This filter takes a compare operator and a comparator.
It compares each column family name with the comparator using the compare operator and if the comparison returns true, it returns all the Cells in that column family.

**QualifierFilter**\\
This filter takes a compare operator and a comparator.
It compares each qualifier name with the comparator using the compare operator and if the comparison returns true, it returns all the key-values in that column.

**ValueFilter**\\
This filter takes a compare operator and a comparator.
It compares each value with the comparator using the compare operator and if the comparison returns true, it returns that key-value.

**DependentColumnFilter**\\
This filter takes two arguments – a family and a qualifier.
It tries to locate this column in each row and returns all key-values in that row that have the same timestamp.
If the row doesn't contain the specified column – none of the key-values in that row will be returned.

**SingleColumnValueFilter**\\
This filter takes a column family, a qualifier, a compare operator and a comparator.
If the specified column is not found – all the columns of that row will be emitted.
If the column is found and the comparison with the comparator returns true, all the columns of the row will be emitted.
If the condition fails, the row will not be emitted.

**SingleColumnValueExcludeFilter**\\
This filter takes the same arguments and behaves same as SingleColumnValueFilter – however, if the column is found and the condition passes, all the columns of the row will be emitted except for the tested column value.

**ColumnRangeFilter**\\
This filter is used for selecting only those keys with columns that are between minColumn and maxColumn.
It also takes two boolean variables to indicate whether to include the minColumn and maxColumn or not.
`,s={title:"Thrift API and Filter Language",description:"Apache Thrift is a cross-platform, cross-language development framework. HBase includes a Thrift API and filter language. The Thrift API relies on client and server processes."},l=[{href:"https://thrift.apache.org/"},{href:"/docs/security/client-access#client-side-configuration-for-secure-operation---thrift-gateway"},{href:"/docs/security/client-access#configure-the-thrift-gateway-to-authenticate-on-behalf-of-the-client"}],o={contents:[{heading:void 0,content:"You can configure Thrift for secure authentication at the server and client side, by following the procedures in Client-side Configuration for Secure Operation - Thrift Gateway and Configure the Thrift Gateway to Authenticate on Behalf of the Client."},{heading:void 0,content:"The rest of this chapter discusses the filter language provided by the Thrift API."},{heading:"filter-language",content:"Thrift Filter Language was introduced in HBase 0.92.\nIt allows you to perform server-side filtering when accessing HBase over Thrift or in the HBase shell.\nYou can find out more about shell integration by using the `scan help` command in the shell."},{heading:"filter-language",content:"You specify a filter as a string, which is parsed on the server to construct the filter."},{heading:"general-filter-string-syntax",content:"A simple filter expression is expressed as a string:"},{heading:"general-filter-string-syntax",content:"Keep the following syntax guidelines in mind."},{heading:"general-filter-string-syntax",content:"Specify the name of the filter followed by the comma-separated argument list in parentheses."},{heading:"general-filter-string-syntax",content:"If the argument represents a string, it should be enclosed in single quotes (`'`)."},{heading:"general-filter-string-syntax",content:"Arguments which represent a boolean, an integer, or a comparison operator (such as `<`, `>`, or `!=`), should not be enclosed in quotes"},{heading:"general-filter-string-syntax",content:`The filter name must be a single word.
All ASCII characters are allowed except for whitespace, single quotes and parentheses.`},{heading:"general-filter-string-syntax",content:`The filter's arguments can contain any ASCII character.
If single quotes are present in the argument, they must be escaped by an additional preceding single quote.`},{heading:"binary-operators",content:"**`AND`**\\\nIf the `AND` operator is used, the key-value must satisfy both filters."},{heading:"binary-operators",content:"**`OR`**\\\nIf the `OR` operator is used, the key-value must satisfy at least one of the filters."},{heading:"unary-operators",content:"**`SKIP`**\\\nFor a particular row, if any of the key-values fail the filter condition, the entire row is skipped."},{heading:"unary-operators",content:"**`WHILE`**\\\nFor a particular row, key-values will be emitted until a key-value is reached that fails the filter condition."},{heading:"compound-operators",content:"You can combine multiple operators to create a hierarchy of filters, such as the following example:"},{heading:"order-of-evaluation",content:"Parentheses have the highest precedence."},{heading:"order-of-evaluation",content:"The unary operators `SKIP` and `WHILE` are next, and have the same precedence."},{heading:"order-of-evaluation",content:"The binary operators follow. `AND` has highest precedence, followed by `OR`."},{heading:"precedence-example",content:"You can use parentheses to explicitly control the order of evaluation."},{heading:"compare-operator",content:"The following compare operators are provided:"},{heading:"compare-operator",content:"LESS (`<`)"},{heading:"compare-operator",content:"LESS\\_OR\\_EQUAL (`<=`)"},{heading:"compare-operator",content:"EQUAL (`=`)"},{heading:"compare-operator",content:"NOT\\_EQUAL (`!=`)"},{heading:"compare-operator",content:"GREATER\\_OR\\_EQUAL (`>=`)"},{heading:"compare-operator",content:"GREATER (`>`)"},{heading:"compare-operator",content:"NO\\_OP (no operation)"},{heading:"compare-operator",content:"The client should use the symbols (`<`, `<=`, `=`, `!=`, `>`, `>=`) to express compare operators."},{heading:"comparator",content:"A comparator can be any of the following:"},{heading:"comparator",content:"*BinaryComparator* - This lexicographically compares against the specified byte array using Bytes.compareTo(byte\\[], byte\\[])"},{heading:"comparator",content:`*BinaryPrefixComparator* - This lexicographically compares against a specified byte array.
It only compares up to the length of this byte array.`},{heading:"comparator",content:`*RegexStringComparator* - This compares against the specified byte array using the given regular expression.
Only EQUAL and NOT\\_EQUAL comparisons are valid with this comparator`},{heading:"comparator",content:`*SubStringComparator* - This tests if the given substring appears in a specified byte array.
The comparison is case insensitive.
Only EQUAL and NOT\\_EQUAL comparisons are valid with this comparator`},{heading:"comparator",content:"The general syntax of a comparator is: `ComparatorType:ComparatorValue`"},{heading:"comparator",content:"The ComparatorType for the various comparators is as follows:"},{heading:"comparator",content:"*BinaryComparator* - binary"},{heading:"comparator",content:"*BinaryPrefixComparator* - binaryprefix"},{heading:"comparator",content:"*RegexStringComparator* - regexstring"},{heading:"comparator",content:"*SubStringComparator* - substring"},{heading:"comparator",content:"The ComparatorValue can be any value."},{heading:"example-comparatorvalues",content:'`binary:abc` will match everything that is lexicographically greater than "abc"'},{heading:"example-comparatorvalues",content:'`binaryprefix:abc` will match everything whose first 3 characters are lexicographically equal to "abc"'},{heading:"example-comparatorvalues",content:'`regexstring:ab*yz` will match everything that doesn\'t begin with "ab" and ends with "yz"'},{heading:"example-comparatorvalues",content:'`substring:abc123` will match everything that begins with the substring "abc123"'},{heading:"example-filter-strings",content:"`\"PrefixFilter ('Row') AND PageFilter (1) AND FirstKeyOnlyFilter ()\"` will return all key-value pairs that match the following conditions:"},{heading:"example-filter-strings",content:"The row containing the key-value should have prefix *Row*"},{heading:"example-filter-strings",content:"The key-value must be located in the first row of the table"},{heading:"example-filter-strings",content:"The key-value pair must be the first key-value in the row"},{heading:"example-filter-strings",content:"`\"(RowFilter (=, 'binary:Row 1') AND TimeStampsFilter (74689, 89734)) OR ColumnRangeFilter ('abc', true, 'xyz', false))\"` will return all key-value pairs that match both the following conditions:"},{heading:"example-filter-strings",content:"The key-value is in a row having row key *Row 1*"},{heading:"example-filter-strings",content:"The key-value must have a timestamp of either 74689 or 89734."},{heading:"example-filter-strings",content:"Or it must match the following condition:"},{heading:"example-filter-strings",content:"The key-value pair must be in a column that is lexicographically >= abc and \\< xyz"},{heading:"example-filter-strings",content:'`"SKIP ValueFilter (0)"` will skip the entire row if any of the values in the row is not 0'},{heading:"individual-filter-syntax",content:`**KeyOnlyFilter**\\
This filter doesn't take any arguments.
It returns only the key component of each key-value.`},{heading:"individual-filter-syntax",content:`**FirstKeyOnlyFilter**\\
This filter doesn't take any arguments.
It returns only the first key-value from each row.`},{heading:"individual-filter-syntax",content:`**PrefixFilter**\\
This filter takes one argument – a prefix of a row key.
It returns only those key-values present in a row that starts with the specified row prefix`},{heading:"individual-filter-syntax",content:`**ColumnPrefixFilter**\\
This filter takes one argument – a column prefix.
It returns only those key-values present in a column that starts with the specified column prefix.
The column prefix must be of the form: \`"qualifier"\`.`},{heading:"individual-filter-syntax",content:`**MultipleColumnPrefixFilter**\\
This filter takes a list of column prefixes.
It returns key-values that are present in a column that starts with any of the specified column prefixes.
Each of the column prefixes must be of the form: \`"qualifier"\`.`},{heading:"individual-filter-syntax",content:`**ColumnCountGetFilter**\\
This filter takes one argument – a limit.
It returns the first limit number of columns in the table.`},{heading:"individual-filter-syntax",content:`**PageFilter**\\
This filter takes one argument – a page size.
It returns page size number of rows from the table.`},{heading:"individual-filter-syntax",content:`**ColumnPaginationFilter**\\
This filter takes two arguments – a limit and offset.
It returns limit number of columns after offset number of columns.
It does this for all the rows.`},{heading:"individual-filter-syntax",content:`**InclusiveStopFilter**\\
This filter takes one argument – a row key on which to stop scanning.
It returns all key-values present in rows up to and including the specified row.`},{heading:"individual-filter-syntax",content:`**TimeStampsFilter**\\
This filter takes a list of timestamps.
It returns those key-values whose timestamps matches any of the specified timestamps.`},{heading:"individual-filter-syntax",content:`**RowFilter**\\
This filter takes a compare operator and a comparator.
It compares each row key with the comparator using the compare operator and if the comparison returns true, it returns all the key-values in that row.`},{heading:"individual-filter-syntax",content:`**Family Filter**\\
This filter takes a compare operator and a comparator.
It compares each column family name with the comparator using the compare operator and if the comparison returns true, it returns all the Cells in that column family.`},{heading:"individual-filter-syntax",content:`**QualifierFilter**\\
This filter takes a compare operator and a comparator.
It compares each qualifier name with the comparator using the compare operator and if the comparison returns true, it returns all the key-values in that column.`},{heading:"individual-filter-syntax",content:`**ValueFilter**\\
This filter takes a compare operator and a comparator.
It compares each value with the comparator using the compare operator and if the comparison returns true, it returns that key-value.`},{heading:"individual-filter-syntax",content:`**DependentColumnFilter**\\
This filter takes two arguments – a family and a qualifier.
It tries to locate this column in each row and returns all key-values in that row that have the same timestamp.
If the row doesn't contain the specified column – none of the key-values in that row will be returned.`},{heading:"individual-filter-syntax",content:`**SingleColumnValueFilter**\\
This filter takes a column family, a qualifier, a compare operator and a comparator.
If the specified column is not found – all the columns of that row will be emitted.
If the column is found and the comparison with the comparator returns true, all the columns of the row will be emitted.
If the condition fails, the row will not be emitted.`},{heading:"individual-filter-syntax",content:`**SingleColumnValueExcludeFilter**\\
This filter takes the same arguments and behaves same as SingleColumnValueFilter – however, if the column is found and the condition passes, all the columns of the row will be emitted except for the tested column value.`},{heading:"individual-filter-syntax",content:`**ColumnRangeFilter**\\
This filter is used for selecting only those keys with columns that are between minColumn and maxColumn.
It also takes two boolean variables to indicate whether to include the minColumn and maxColumn or not.`}],headings:[{id:"filter-language",content:"Filter Language"},{id:"general-filter-string-syntax",content:"General Filter String Syntax"},{id:"compound-filters-and-operators",content:"Compound Filters and Operators"},{id:"binary-operators",content:"Binary Operators"},{id:"unary-operators",content:"Unary Operators"},{id:"compound-operators",content:"Compound Operators"},{id:"order-of-evaluation",content:"Order of Evaluation"},{id:"precedence-example",content:"Precedence Example"},{id:"compare-operator",content:"Compare Operator"},{id:"comparator",content:"Comparator"},{id:"example-comparatorvalues",content:"Example ComparatorValues"},{id:"example-php-client-program-that-uses-the-filter-language",content:"Example PHP Client Program that uses the Filter Language"},{id:"example-filter-strings",content:"Example Filter Strings"},{id:"individual-filter-syntax",content:"Individual Filter Syntax"}]},h=[{depth:2,url:"#filter-language",title:e.jsx(e.Fragment,{children:"Filter Language"})},{depth:3,url:"#general-filter-string-syntax",title:e.jsx(e.Fragment,{children:"General Filter String Syntax"})},{depth:3,url:"#compound-filters-and-operators",title:e.jsx(e.Fragment,{children:"Compound Filters and Operators"})},{depth:4,url:"#binary-operators",title:e.jsx(e.Fragment,{children:"Binary Operators"})},{depth:4,url:"#unary-operators",title:e.jsx(e.Fragment,{children:"Unary Operators"})},{depth:4,url:"#compound-operators",title:e.jsx(e.Fragment,{children:"Compound Operators"})},{depth:3,url:"#order-of-evaluation",title:e.jsx(e.Fragment,{children:"Order of Evaluation"})},{depth:4,url:"#precedence-example",title:e.jsx(e.Fragment,{children:"Precedence Example"})},{depth:3,url:"#compare-operator",title:e.jsx(e.Fragment,{children:"Compare Operator"})},{depth:3,url:"#comparator",title:e.jsx(e.Fragment,{children:"Comparator"})},{depth:4,url:"#example-comparatorvalues",title:e.jsx(e.Fragment,{children:"Example ComparatorValues"})},{depth:3,url:"#example-php-client-program-that-uses-the-filter-language",title:e.jsx(e.Fragment,{children:"Example PHP Client Program that uses the Filter Language"})},{depth:3,url:"#example-filter-strings",title:e.jsx(e.Fragment,{children:"Example Filter Strings"})},{depth:3,url:"#individual-filter-syntax",title:e.jsx(e.Fragment,{children:"Individual Filter Syntax"})}];function n(t){const i={a:"a",br:"br",code:"code",em:"em",h2:"h2",h3:"h3",h4:"h4",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...t.components};return e.jsxs(e.Fragment,{children:[e.jsxs(i.p,{children:["You can configure ",e.jsx(i.a,{href:"https://thrift.apache.org/",children:"Thrift"})," for secure authentication at the server and client side, by following the procedures in ",e.jsx(i.a,{href:"/docs/security/client-access#client-side-configuration-for-secure-operation---thrift-gateway",children:"Client-side Configuration for Secure Operation - Thrift Gateway"})," and ",e.jsx(i.a,{href:"/docs/security/client-access#configure-the-thrift-gateway-to-authenticate-on-behalf-of-the-client",children:"Configure the Thrift Gateway to Authenticate on Behalf of the Client"}),"."]}),`
`,e.jsx(i.p,{children:"The rest of this chapter discusses the filter language provided by the Thrift API."}),`
`,e.jsx(i.h2,{id:"filter-language",children:"Filter Language"}),`
`,e.jsxs(i.p,{children:[`Thrift Filter Language was introduced in HBase 0.92.
It allows you to perform server-side filtering when accessing HBase over Thrift or in the HBase shell.
You can find out more about shell integration by using the `,e.jsx(i.code,{children:"scan help"})," command in the shell."]}),`
`,e.jsx(i.p,{children:"You specify a filter as a string, which is parsed on the server to construct the filter."}),`
`,e.jsx(i.h3,{id:"general-filter-string-syntax",children:"General Filter String Syntax"}),`
`,e.jsx(i.p,{children:"A simple filter expression is expressed as a string:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:'"FilterName (argument, argument,... , argument)"'})})})})}),`
`,e.jsx(i.p,{children:"Keep the following syntax guidelines in mind."}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"Specify the name of the filter followed by the comma-separated argument list in parentheses."}),`
`,e.jsxs(i.li,{children:["If the argument represents a string, it should be enclosed in single quotes (",e.jsx(i.code,{children:"'"}),")."]}),`
`,e.jsxs(i.li,{children:["Arguments which represent a boolean, an integer, or a comparison operator (such as ",e.jsx(i.code,{children:"<"}),", ",e.jsx(i.code,{children:">"}),", or ",e.jsx(i.code,{children:"!="}),"), should not be enclosed in quotes"]}),`
`,e.jsx(i.li,{children:`The filter name must be a single word.
All ASCII characters are allowed except for whitespace, single quotes and parentheses.`}),`
`,e.jsx(i.li,{children:`The filter's arguments can contain any ASCII character.
If single quotes are present in the argument, they must be escaped by an additional preceding single quote.`}),`
`]}),`
`,e.jsx(i.h3,{id:"compound-filters-and-operators",children:"Compound Filters and Operators"}),`
`,e.jsx(i.h4,{id:"binary-operators",children:"Binary Operators"}),`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:e.jsx(i.code,{children:"AND"})}),e.jsx(i.br,{}),`
`,"If the ",e.jsx(i.code,{children:"AND"})," operator is used, the key-value must satisfy both filters."]}),`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:e.jsx(i.code,{children:"OR"})}),e.jsx(i.br,{}),`
`,"If the ",e.jsx(i.code,{children:"OR"})," operator is used, the key-value must satisfy at least one of the filters."]}),`
`,e.jsx(i.h4,{id:"unary-operators",children:"Unary Operators"}),`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:e.jsx(i.code,{children:"SKIP"})}),e.jsx(i.br,{}),`
`,"For a particular row, if any of the key-values fail the filter condition, the entire row is skipped."]}),`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:e.jsx(i.code,{children:"WHILE"})}),e.jsx(i.br,{}),`
`,"For a particular row, key-values will be emitted until a key-value is reached that fails the filter condition."]}),`
`,e.jsx(i.h4,{id:"compound-operators",children:"Compound Operators"}),`
`,e.jsx(i.p,{children:"You can combine multiple operators to create a hierarchy of filters, such as the following example:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(i.code,{children:e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"(Filter1 AND Filter2) OR (Filter3 AND Filter4)"})})})})}),`
`,e.jsx(i.h3,{id:"order-of-evaluation",children:"Order of Evaluation"}),`
`,e.jsxs(i.ol,{children:[`
`,e.jsx(i.li,{children:"Parentheses have the highest precedence."}),`
`,e.jsxs(i.li,{children:["The unary operators ",e.jsx(i.code,{children:"SKIP"})," and ",e.jsx(i.code,{children:"WHILE"})," are next, and have the same precedence."]}),`
`,e.jsxs(i.li,{children:["The binary operators follow. ",e.jsx(i.code,{children:"AND"})," has highest precedence, followed by ",e.jsx(i.code,{children:"OR"}),"."]}),`
`]}),`
`,e.jsx(i.h4,{id:"precedence-example",children:"Precedence Example"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"Filter1 AND Filter2 OR Filter"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"is evaluated as"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"(Filter1 AND Filter2) OR Filter3"})})]})})}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"Filter1 AND SKIP Filter2 OR Filter3"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"is evaluated as"})}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{children:"(Filter1 AND (SKIP Filter2)) OR Filter3"})})]})})}),`
`,e.jsx(i.p,{children:"You can use parentheses to explicitly control the order of evaluation."}),`
`,e.jsx(i.h3,{id:"compare-operator",children:"Compare Operator"}),`
`,e.jsx(i.p,{children:"The following compare operators are provided:"}),`
`,e.jsxs(i.ol,{children:[`
`,e.jsxs(i.li,{children:["LESS (",e.jsx(i.code,{children:"<"}),")"]}),`
`,e.jsxs(i.li,{children:["LESS_OR_EQUAL (",e.jsx(i.code,{children:"<="}),")"]}),`
`,e.jsxs(i.li,{children:["EQUAL (",e.jsx(i.code,{children:"="}),")"]}),`
`,e.jsxs(i.li,{children:["NOT_EQUAL (",e.jsx(i.code,{children:"!="}),")"]}),`
`,e.jsxs(i.li,{children:["GREATER_OR_EQUAL (",e.jsx(i.code,{children:">="}),")"]}),`
`,e.jsxs(i.li,{children:["GREATER (",e.jsx(i.code,{children:">"}),")"]}),`
`,e.jsx(i.li,{children:"NO_OP (no operation)"}),`
`]}),`
`,e.jsxs(i.p,{children:["The client should use the symbols (",e.jsx(i.code,{children:"<"}),", ",e.jsx(i.code,{children:"<="}),", ",e.jsx(i.code,{children:"="}),", ",e.jsx(i.code,{children:"!="}),", ",e.jsx(i.code,{children:">"}),", ",e.jsx(i.code,{children:">="}),") to express compare operators."]}),`
`,e.jsx(i.h3,{id:"comparator",children:"Comparator"}),`
`,e.jsx(i.p,{children:"A comparator can be any of the following:"}),`
`,e.jsxs(i.ol,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.em,{children:"BinaryComparator"})," - This lexicographically compares against the specified byte array using Bytes.compareTo(byte[], byte[])"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.em,{children:"BinaryPrefixComparator"}),` - This lexicographically compares against a specified byte array.
It only compares up to the length of this byte array.`]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.em,{children:"RegexStringComparator"}),` - This compares against the specified byte array using the given regular expression.
Only EQUAL and NOT_EQUAL comparisons are valid with this comparator`]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.em,{children:"SubStringComparator"}),` - This tests if the given substring appears in a specified byte array.
The comparison is case insensitive.
Only EQUAL and NOT_EQUAL comparisons are valid with this comparator`]}),`
`]}),`
`,e.jsxs(i.p,{children:["The general syntax of a comparator is: ",e.jsx(i.code,{children:"ComparatorType:ComparatorValue"})]}),`
`,e.jsx(i.p,{children:"The ComparatorType for the various comparators is as follows:"}),`
`,e.jsxs(i.ol,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.em,{children:"BinaryComparator"})," - binary"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.em,{children:"BinaryPrefixComparator"})," - binaryprefix"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.em,{children:"RegexStringComparator"})," - regexstring"]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.em,{children:"SubStringComparator"})," - substring"]}),`
`]}),`
`,e.jsx(i.p,{children:"The ComparatorValue can be any value."}),`
`,e.jsx(i.h4,{id:"example-comparatorvalues",children:"Example ComparatorValues"}),`
`,e.jsxs(i.ol,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"binary:abc"}),' will match everything that is lexicographically greater than "abc"']}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"binaryprefix:abc"}),' will match everything whose first 3 characters are lexicographically equal to "abc"']}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"regexstring:ab*yz"}),` will match everything that doesn't begin with "ab" and ends with "yz"`]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:"substring:abc123"}),' will match everything that begins with the substring "abc123"']}),`
`]}),`
`,e.jsx(i.h3,{id:"example-php-client-program-that-uses-the-filter-language",children:"Example PHP Client Program that uses the Filter Language"}),`
`,e.jsx(e.Fragment,{children:e.jsx(i.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M7.01 10.207h-.944l-.515 2.648h.838c.556 0 .97-.105 1.242-.314.272-.21.455-.559.55-1.049.092-.47.05-.802-.124-.995-.175-.193-.523-.29-1.047-.29zM12 5.688C5.373 5.688 0 8.514 0 12s5.373 6.313 12 6.313S24 15.486 24 12c0-3.486-5.373-6.312-12-6.312zm-3.26 7.451c-.261.25-.575.438-.917.551-.336.108-.765.164-1.285.164H5.357l-.327 1.681H3.652l1.23-6.326h2.65c.797 0 1.378.209 1.744.628.366.418.476 1.002.33 1.752a2.836 2.836 0 0 1-.305.847c-.143.255-.33.49-.561.703zm4.024.715l.543-2.799c.063-.318.039-.536-.068-.651-.107-.116-.336-.174-.687-.174H11.46l-.704 3.625H9.388l1.23-6.327h1.367l-.327 1.682h1.218c.767 0 1.295.134 1.586.401s.378.7.263 1.299l-.572 2.944h-1.389zm7.597-2.265a2.782 2.782 0 0 1-.305.847c-.143.255-.33.49-.561.703a2.44 2.44 0 0 1-.917.551c-.336.108-.765.164-1.286.164h-1.18l-.327 1.682h-1.378l1.23-6.326h2.649c.797 0 1.378.209 1.744.628.366.417.477 1.001.331 1.751zM17.766 10.207h-.943l-.516 2.648h.838c.557 0 .971-.105 1.242-.314.272-.21.455-.559.551-1.049.092-.47.049-.802-.125-.995s-.524-.29-1.047-.29z" fill="currentColor" /></svg>',children:e.jsxs(i.code,{children:[e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<?"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  $_SERVER["}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'PHP_ROOT'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"] "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" realpath"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"dirname"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"__FILE__"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'/..'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  require_once"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" $_SERVER["}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'PHP_ROOT'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"]"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"."}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'/flib/__flib.php'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:";"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  flib_init"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"FLIB_CONTEXT_SCRIPT"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"  require_module"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'storage/hbase'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  $hbase "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" new"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" HBase"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'<server_name_running_thrift_server>'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"<"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"port"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" on"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" which"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" thrift"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" server"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" is"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" running"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:">"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  $hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"->"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"open"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  $client "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" $hbase"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"->"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"getClient"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"();"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  $result "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" $client"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"->"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"scannerOpenWithFilterString"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"("}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:"'table_name'"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:", "}),e.jsx(i.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:`"(PrefixFilter ('row2') AND (QualifierFilter (>=, 'binary:xyz'))) AND (TimestampsFilter ( 123, 456))"`}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  $to_print "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" $client"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"->"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"scannerGetList"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"($result,"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"  while"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" ($to_print) {"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"    print_r"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"($to_print);"})]}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    $to_print "}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:" $client"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"->"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"scannerGetList"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"($result,"}),e.jsx(i.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"1"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:");"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  }"})}),`
`,e.jsxs(i.span,{className:"line",children:[e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  $client"}),e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"->"}),e.jsx(i.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"scannerClose"}),e.jsx(i.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"($result);"})]}),`
`,e.jsx(i.span,{className:"line",children:e.jsx(i.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"?>"})})]})})}),`
`,e.jsx(i.h3,{id:"example-filter-strings",children:"Example Filter Strings"}),`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:`"PrefixFilter ('Row') AND PageFilter (1) AND FirstKeyOnlyFilter ()"`})," will return all key-value pairs that match the following conditions:",`
`,e.jsxs(i.ol,{children:[`
`,e.jsxs(i.li,{children:["The row containing the key-value should have prefix ",e.jsx(i.em,{children:"Row"})]}),`
`,e.jsx(i.li,{children:"The key-value must be located in the first row of the table"}),`
`,e.jsx(i.li,{children:"The key-value pair must be the first key-value in the row"}),`
`]}),`
`]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:`"(RowFilter (=, 'binary:Row 1') AND TimeStampsFilter (74689, 89734)) OR ColumnRangeFilter ('abc', true, 'xyz', false))"`})," will return all key-value pairs that match both the following conditions:",`
`,e.jsxs(i.ul,{children:[`
`,e.jsxs(i.li,{children:["The key-value is in a row having row key ",e.jsx(i.em,{children:"Row 1"})]}),`
`,e.jsx(i.li,{children:"The key-value must have a timestamp of either 74689 or 89734."}),`
`,e.jsxs(i.li,{children:["Or it must match the following condition:",`
`,e.jsxs(i.ul,{children:[`
`,e.jsx(i.li,{children:"The key-value pair must be in a column that is lexicographically >= abc and < xyz"}),`
`]}),`
`]}),`
`]}),`
`]}),`
`,e.jsxs(i.li,{children:[e.jsx(i.code,{children:'"SKIP ValueFilter (0)"'})," will skip the entire row if any of the values in the row is not 0"]}),`
`]}),`
`,e.jsx(i.h3,{id:"individual-filter-syntax",children:"Individual Filter Syntax"}),`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"KeyOnlyFilter"}),e.jsx(i.br,{}),`
`,`This filter doesn't take any arguments.
It returns only the key component of each key-value.`]}),`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"FirstKeyOnlyFilter"}),e.jsx(i.br,{}),`
`,`This filter doesn't take any arguments.
It returns only the first key-value from each row.`]}),`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"PrefixFilter"}),e.jsx(i.br,{}),`
`,`This filter takes one argument – a prefix of a row key.
It returns only those key-values present in a row that starts with the specified row prefix`]}),`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"ColumnPrefixFilter"}),e.jsx(i.br,{}),`
`,`This filter takes one argument – a column prefix.
It returns only those key-values present in a column that starts with the specified column prefix.
The column prefix must be of the form: `,e.jsx(i.code,{children:'"qualifier"'}),"."]}),`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"MultipleColumnPrefixFilter"}),e.jsx(i.br,{}),`
`,`This filter takes a list of column prefixes.
It returns key-values that are present in a column that starts with any of the specified column prefixes.
Each of the column prefixes must be of the form: `,e.jsx(i.code,{children:'"qualifier"'}),"."]}),`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"ColumnCountGetFilter"}),e.jsx(i.br,{}),`
`,`This filter takes one argument – a limit.
It returns the first limit number of columns in the table.`]}),`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"PageFilter"}),e.jsx(i.br,{}),`
`,`This filter takes one argument – a page size.
It returns page size number of rows from the table.`]}),`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"ColumnPaginationFilter"}),e.jsx(i.br,{}),`
`,`This filter takes two arguments – a limit and offset.
It returns limit number of columns after offset number of columns.
It does this for all the rows.`]}),`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"InclusiveStopFilter"}),e.jsx(i.br,{}),`
`,`This filter takes one argument – a row key on which to stop scanning.
It returns all key-values present in rows up to and including the specified row.`]}),`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"TimeStampsFilter"}),e.jsx(i.br,{}),`
`,`This filter takes a list of timestamps.
It returns those key-values whose timestamps matches any of the specified timestamps.`]}),`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"RowFilter"}),e.jsx(i.br,{}),`
`,`This filter takes a compare operator and a comparator.
It compares each row key with the comparator using the compare operator and if the comparison returns true, it returns all the key-values in that row.`]}),`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"Family Filter"}),e.jsx(i.br,{}),`
`,`This filter takes a compare operator and a comparator.
It compares each column family name with the comparator using the compare operator and if the comparison returns true, it returns all the Cells in that column family.`]}),`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"QualifierFilter"}),e.jsx(i.br,{}),`
`,`This filter takes a compare operator and a comparator.
It compares each qualifier name with the comparator using the compare operator and if the comparison returns true, it returns all the key-values in that column.`]}),`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"ValueFilter"}),e.jsx(i.br,{}),`
`,`This filter takes a compare operator and a comparator.
It compares each value with the comparator using the compare operator and if the comparison returns true, it returns that key-value.`]}),`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"DependentColumnFilter"}),e.jsx(i.br,{}),`
`,`This filter takes two arguments – a family and a qualifier.
It tries to locate this column in each row and returns all key-values in that row that have the same timestamp.
If the row doesn't contain the specified column – none of the key-values in that row will be returned.`]}),`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"SingleColumnValueFilter"}),e.jsx(i.br,{}),`
`,`This filter takes a column family, a qualifier, a compare operator and a comparator.
If the specified column is not found – all the columns of that row will be emitted.
If the column is found and the comparison with the comparator returns true, all the columns of the row will be emitted.
If the condition fails, the row will not be emitted.`]}),`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"SingleColumnValueExcludeFilter"}),e.jsx(i.br,{}),`
`,"This filter takes the same arguments and behaves same as SingleColumnValueFilter – however, if the column is found and the condition passes, all the columns of the row will be emitted except for the tested column value."]}),`
`,e.jsxs(i.p,{children:[e.jsx(i.strong,{children:"ColumnRangeFilter"}),e.jsx(i.br,{}),`
`,`This filter is used for selecting only those keys with columns that are between minColumn and maxColumn.
It also takes two boolean variables to indicate whether to include the minColumn and maxColumn or not.`]})]})}function c(t={}){const{wrapper:i}=t.components||{};return i?e.jsx(i,{...t,children:e.jsx(n,{...t})}):n(t)}export{a as _markdown,c as default,l as extractedReferences,s as frontmatter,o as structuredData,h as toc};
