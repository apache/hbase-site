import{j as e}from"./chunk-EPOLDU6W-B5LwAila.js";let o=`## Eclipse

### Code Formatting

Under the *dev-support/* folder, you will find *hbase\\_eclipse\\_formatter.xml*.
We encourage you to have this formatter in place in eclipse when editing HBase code.

Go to \`Preferences->Java->Code Style->Formatter->Import\` to load the xml file.
Go to \`Preferences->Java->Editor->Save Actions\`, and make sure 'Format source code' and 'Format
edited lines' is selected.

In addition to the automatic formatting, make sure you follow the style guidelines explained in
[Code Formatting Conventions](/docs/building-and-developing/developer-guidelines#code-formatting-conventions).

### Eclipse Git Plugin

If you cloned the project via git, download and install the Git plugin (EGit). Attach to your local git repo (via the Git Repositories window) and you'll be able to see file revision history, generate patches, etc.

### HBase Project Setup in Eclipse using \`m2eclipse\`

The easiest way is to use the \`m2eclipse\` plugin for Eclipse.
Eclipse Indigo or newer includes +m2eclipse+, or you can download it from [http://www.eclipse.org/m2e/](http://www.eclipse.org/m2e/). It provides Maven integration for Eclipse, and even lets you use the direct Maven commands from within Eclipse to compile and test your project.

To import the project, click and select the HBase root directory. \`m2eclipse\` locates all the hbase modules for you.

If you install \`m2eclipse\` and import HBase in your workspace, do the following to fix your eclipse Build Path.

* Remove *target* folder
* Add *target/generated-sources/java* folder.
* Remove from your Build Path the exclusions on the *src/main/resources* and *src/test/resources* to avoid error message in the console, such as the following:
  \`\`\`text
  Failed to execute goal
  org.apache.maven.plugins:maven-antrun-plugin:1.6:run (default) on project hbase:
  'An Ant BuildException has occurred: Replace: source file .../target/classes/hbase-default.xml
  doesn't exist
  \`\`\`
  This will also reduce the eclipse build cycles and make your life easier when developing.

### HBase Project Setup in Eclipse Using the Command Line

Instead of using \`m2eclipse\`, you can generate the Eclipse files from the command line.

* First, run the following command, which builds HBase.
  You only need to do this once.

  \`\`\`bash
  mvn clean install -DskipTests
  \`\`\`

* Close Eclipse, and execute the following command from the terminal, in your local HBase project directory, to generate new *.project* and *.classpath* files.

  \`\`\`bash
  mvn eclipse:eclipse
  \`\`\`

* Reopen Eclipse and import the *.project* file in the HBase directory to a workspace.

### Maven Classpath Variable

The \`$M2_REPO\` classpath variable needs to be set up for the project.
This needs to be set to your local Maven repository, which is usually *\\~/.m2/repository*

If this classpath variable is not configured, you will see compile errors in Eclipse like this:

\`\`\`text
Description        Resource        Path        Location        Type
The project cannot be built until build path errors are resolved        hbase                Unknown        Java Problem
Unbound classpath variable: 'M2_REPO/asm/asm/3.1/asm-3.1.jar' in project 'hbase'        hbase                Build path        Build Path Problem
Unbound classpath variable: 'M2_REPO/com/google/guava/guava/r09/guava-r09.jar' in project 'hbase'        hbase                Build path        Build Path Problem
Unbound classpath variable: 'M2_REPO/com/google/protobuf/protobuf-java/2.3.0/protobuf-java-2.3.0.jar' in project 'hbase'        hbase                Build path        Build Path Problem Unbound classpath variable:
\`\`\`

### Eclipse Known Issues

Eclipse will currently complain about *Bytes.java*.
It is not possible to turn these errors off.

\`\`\`text
Description        Resource        Path        Location        Type
Access restriction: The method arrayBaseOffset(Class) from the type Unsafe is not accessible due to restriction on required library /System/Library/Java/JavaVirtualMachines/1.6.0.jdk/Contents/Classes/classes.jar        Bytes.java        /hbase/src/main/java/org/apache/hadoop/hbase/util        line 1061        Java Problem
Access restriction: The method arrayIndexScale(Class) from the type Unsafe is not accessible due to restriction on required library /System/Library/Java/JavaVirtualMachines/1.6.0.jdk/Contents/Classes/classes.jar        Bytes.java        /hbase/src/main/java/org/apache/hadoop/hbase/util        line 1064        Java Problem
Access restriction: The method getLong(Object, long) from the type Unsafe is not accessible due to restriction on required library /System/Library/Java/JavaVirtualMachines/1.6.0.jdk/Contents/Classes/classes.jar        Bytes.java        /hbase/src/main/java/org/apache/hadoop/hbase/util        line 1111        Java Problem
\`\`\`

### Eclipse - More Information

For additional information on setting up Eclipse for HBase development on Windows, see [Michael Morello's blog](http://michaelmorello.blogspot.com/2011/09/hbase-subversion-eclipse-windows.html) on the topic.

## IntelliJ IDEA

A functional development environment can be setup around an IntelliJ IDEA installation that has the
plugins necessary for building Java projects with Maven.

* Use either File > New > "Project from Existing Sources..." or "Project From Version Control.."
* Depending on your version of IntelliJ, you may need to choose Maven as the "project" or "model"
  type.

The following plugins are recommended:

* Maven, bundled. This allows IntelliJ to resolve dependencies and recognize the project structure.
* EditorConfig, bundled. This will apply project whitespace settings found in the
  \`.editorconfig\` file available on branches with
  [HBASE-23234](https://issues.apache.org/jira/browse/HBASE-23234) or later.
* [Checkstyle-IDEA](https://plugins.jetbrains.com/plugin/1065-checkstyle-idea/). Configure this
  against the configuration file found under \`hbase-checkstyle/src/main/resources/hbase/checkstyle.xml\`
  (If the Intellij checkstyle plugin complains parsing the volunteered hbase \`checkstyle.xml\`, make
  sure the plugin's \`version\` popup menu matches the hbase checkstyle version. Find the current
  checkstyle version as a property in \`pom.xml\`.
  This plugin will highlight style errors in the IDE, so you can fix them before they get flagged during the
  pre-commit process.
* [Protobuf Support](https://plugins.jetbrains.com/plugin/8277-protobuf-support/). HBase uses
  [Protocol Buffers](https://developers.google.com/protocol-buffers/) in a number of places where
  serialization is required. This plugin is helpful when editing these object definitions.
* [MDX](https://plugins.jetbrains.com/plugin/14944-mdx). HBase uses
  [MDX](https://mdxjs.com) (just extended markdown) for building it's project documentation. This plugin is helpful
  when editing this book.

## Other IDEs

If you'd have another environment with which you'd like to develop on HBase, please consider
documenting your setup process here.
`,l={title:"IDEs",description:"Setting up Eclipse and IntelliJ IDEA for HBase development including formatters, plugins, and Maven integration."},a=[{href:"/docs/building-and-developing/developer-guidelines#code-formatting-conventions"},{href:"http://www.eclipse.org/m2e/"},{href:"http://michaelmorello.blogspot.com/2011/09/hbase-subversion-eclipse-windows.html"},{href:"https://issues.apache.org/jira/browse/HBASE-23234"},{href:"https://plugins.jetbrains.com/plugin/1065-checkstyle-idea/"},{href:"https://plugins.jetbrains.com/plugin/8277-protobuf-support/"},{href:"https://developers.google.com/protocol-buffers/"},{href:"https://plugins.jetbrains.com/plugin/14944-mdx"},{href:"https://mdxjs.com"}],r={contents:[{heading:"code-formatting",content:`Under the dev-support/ folder, you will find hbase_eclipse_formatter.xml.
We encourage you to have this formatter in place in eclipse when editing HBase code.`},{heading:"code-formatting",content:`Go to Preferences->Java->Code Style->Formatter->Import to load the xml file.
Go to Preferences->Java->Editor->Save Actions, and make sure 'Format source code' and 'Format
edited lines' is selected.`},{heading:"code-formatting",content:`In addition to the automatic formatting, make sure you follow the style guidelines explained in
Code Formatting Conventions.`},{heading:"eclipse-git-plugin",content:"If you cloned the project via git, download and install the Git plugin (EGit). Attach to your local git repo (via the Git Repositories window) and you'll be able to see file revision history, generate patches, etc."},{heading:"hbase-project-setup-in-eclipse-using-m2eclipse",content:`The easiest way is to use the m2eclipse plugin for Eclipse.
Eclipse Indigo or newer includes +m2eclipse+, or you can download it from http://www.eclipse.org/m2e/. It provides Maven integration for Eclipse, and even lets you use the direct Maven commands from within Eclipse to compile and test your project.`},{heading:"hbase-project-setup-in-eclipse-using-m2eclipse",content:"To import the project, click and select the HBase root directory. m2eclipse locates all the hbase modules for you."},{heading:"hbase-project-setup-in-eclipse-using-m2eclipse",content:"If you install m2eclipse and import HBase in your workspace, do the following to fix your eclipse Build Path."},{heading:"hbase-project-setup-in-eclipse-using-m2eclipse",content:"Remove target folder"},{heading:"hbase-project-setup-in-eclipse-using-m2eclipse",content:"Add target/generated-sources/java folder."},{heading:"hbase-project-setup-in-eclipse-using-m2eclipse",content:"Remove from your Build Path the exclusions on the src/main/resources and src/test/resources to avoid error message in the console, such as the following:"},{heading:"hbase-project-setup-in-eclipse-using-m2eclipse",content:"This will also reduce the eclipse build cycles and make your life easier when developing."},{heading:"hbase-project-setup-in-eclipse-using-the-command-line",content:"Instead of using m2eclipse, you can generate the Eclipse files from the command line."},{heading:"hbase-project-setup-in-eclipse-using-the-command-line",content:`First, run the following command, which builds HBase.
You only need to do this once.`},{heading:"hbase-project-setup-in-eclipse-using-the-command-line",content:"Close Eclipse, and execute the following command from the terminal, in your local HBase project directory, to generate new .project and .classpath files."},{heading:"hbase-project-setup-in-eclipse-using-the-command-line",content:"Reopen Eclipse and import the .project file in the HBase directory to a workspace."},{heading:"maven-classpath-variable",content:`The $M2_REPO classpath variable needs to be set up for the project.
This needs to be set to your local Maven repository, which is usually ~/.m2/repository`},{heading:"maven-classpath-variable",content:"If this classpath variable is not configured, you will see compile errors in Eclipse like this:"},{heading:"eclipse-known-issues",content:`Eclipse will currently complain about Bytes.java.
It is not possible to turn these errors off.`},{heading:"eclipse---more-information",content:"For additional information on setting up Eclipse for HBase development on Windows, see Michael Morello's blog on the topic."},{heading:"intellij-idea",content:`A functional development environment can be setup around an IntelliJ IDEA installation that has the
plugins necessary for building Java projects with Maven.`},{heading:"intellij-idea",content:'Use either File > New > "Project from Existing Sources..." or "Project From Version Control.."'},{heading:"intellij-idea",content:`Depending on your version of IntelliJ, you may need to choose Maven as the "project" or "model"
type.`},{heading:"intellij-idea",content:"The following plugins are recommended:"},{heading:"intellij-idea",content:"Maven, bundled. This allows IntelliJ to resolve dependencies and recognize the project structure."},{heading:"intellij-idea",content:`EditorConfig, bundled. This will apply project whitespace settings found in the
.editorconfig file available on branches with
HBASE-23234 or later.`},{heading:"intellij-idea",content:`Checkstyle-IDEA. Configure this
against the configuration file found under hbase-checkstyle/src/main/resources/hbase/checkstyle.xml
(If the Intellij checkstyle plugin complains parsing the volunteered hbase checkstyle.xml, make
sure the plugin's version popup menu matches the hbase checkstyle version. Find the current
checkstyle version as a property in pom.xml.
This plugin will highlight style errors in the IDE, so you can fix them before they get flagged during the
pre-commit process.`},{heading:"intellij-idea",content:`Protobuf Support. HBase uses
Protocol Buffers in a number of places where
serialization is required. This plugin is helpful when editing these object definitions.`},{heading:"intellij-idea",content:`MDX. HBase uses
MDX (just extended markdown) for building it's project documentation. This plugin is helpful
when editing this book.`},{heading:"other-ides",content:`If you'd have another environment with which you'd like to develop on HBase, please consider
documenting your setup process here.`}],headings:[{id:"eclipse",content:"Eclipse"},{id:"code-formatting",content:"Code Formatting"},{id:"eclipse-git-plugin",content:"Eclipse Git Plugin"},{id:"hbase-project-setup-in-eclipse-using-m2eclipse",content:"HBase Project Setup in Eclipse using m2eclipse"},{id:"hbase-project-setup-in-eclipse-using-the-command-line",content:"HBase Project Setup in Eclipse Using the Command Line"},{id:"maven-classpath-variable",content:"Maven Classpath Variable"},{id:"eclipse-known-issues",content:"Eclipse Known Issues"},{id:"eclipse---more-information",content:"Eclipse - More Information"},{id:"intellij-idea",content:"IntelliJ IDEA"},{id:"other-ides",content:"Other IDEs"}]};const c=[{depth:2,url:"#eclipse",title:e.jsx(e.Fragment,{children:"Eclipse"})},{depth:3,url:"#code-formatting",title:e.jsx(e.Fragment,{children:"Code Formatting"})},{depth:3,url:"#eclipse-git-plugin",title:e.jsx(e.Fragment,{children:"Eclipse Git Plugin"})},{depth:3,url:"#hbase-project-setup-in-eclipse-using-m2eclipse",title:e.jsxs(e.Fragment,{children:["HBase Project Setup in Eclipse using ",e.jsx("code",{children:"m2eclipse"})]})},{depth:3,url:"#hbase-project-setup-in-eclipse-using-the-command-line",title:e.jsx(e.Fragment,{children:"HBase Project Setup in Eclipse Using the Command Line"})},{depth:3,url:"#maven-classpath-variable",title:e.jsx(e.Fragment,{children:"Maven Classpath Variable"})},{depth:3,url:"#eclipse-known-issues",title:e.jsx(e.Fragment,{children:"Eclipse Known Issues"})},{depth:3,url:"#eclipse---more-information",title:e.jsx(e.Fragment,{children:"Eclipse - More Information"})},{depth:2,url:"#intellij-idea",title:e.jsx(e.Fragment,{children:"IntelliJ IDEA"})},{depth:2,url:"#other-ides",title:e.jsx(e.Fragment,{children:"Other IDEs"})}];function s(i){const n={a:"a",code:"code",em:"em",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",span:"span",ul:"ul",...i.components};return e.jsxs(e.Fragment,{children:[e.jsx(n.h2,{id:"eclipse",children:"Eclipse"}),`
`,e.jsx(n.h3,{id:"code-formatting",children:"Code Formatting"}),`
`,e.jsxs(n.p,{children:["Under the ",e.jsx(n.em,{children:"dev-support/"})," folder, you will find ",e.jsx(n.em,{children:"hbase_eclipse_formatter.xml"}),`.
We encourage you to have this formatter in place in eclipse when editing HBase code.`]}),`
`,e.jsxs(n.p,{children:["Go to ",e.jsx(n.code,{children:"Preferences->Java->Code Style->Formatter->Import"}),` to load the xml file.
Go to `,e.jsx(n.code,{children:"Preferences->Java->Editor->Save Actions"}),`, and make sure 'Format source code' and 'Format
edited lines' is selected.`]}),`
`,e.jsxs(n.p,{children:[`In addition to the automatic formatting, make sure you follow the style guidelines explained in
`,e.jsx(n.a,{href:"/docs/building-and-developing/developer-guidelines#code-formatting-conventions",children:"Code Formatting Conventions"}),"."]}),`
`,e.jsx(n.h3,{id:"eclipse-git-plugin",children:"Eclipse Git Plugin"}),`
`,e.jsx(n.p,{children:"If you cloned the project via git, download and install the Git plugin (EGit). Attach to your local git repo (via the Git Repositories window) and you'll be able to see file revision history, generate patches, etc."}),`
`,e.jsxs(n.h3,{id:"hbase-project-setup-in-eclipse-using-m2eclipse",children:["HBase Project Setup in Eclipse using ",e.jsx(n.code,{children:"m2eclipse"})]}),`
`,e.jsxs(n.p,{children:["The easiest way is to use the ",e.jsx(n.code,{children:"m2eclipse"}),` plugin for Eclipse.
Eclipse Indigo or newer includes +m2eclipse+, or you can download it from `,e.jsx(n.a,{href:"http://www.eclipse.org/m2e/",children:"http://www.eclipse.org/m2e/"}),". It provides Maven integration for Eclipse, and even lets you use the direct Maven commands from within Eclipse to compile and test your project."]}),`
`,e.jsxs(n.p,{children:["To import the project, click and select the HBase root directory. ",e.jsx(n.code,{children:"m2eclipse"})," locates all the hbase modules for you."]}),`
`,e.jsxs(n.p,{children:["If you install ",e.jsx(n.code,{children:"m2eclipse"})," and import HBase in your workspace, do the following to fix your eclipse Build Path."]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Remove ",e.jsx(n.em,{children:"target"})," folder"]}),`
`,e.jsxs(n.li,{children:["Add ",e.jsx(n.em,{children:"target/generated-sources/java"})," folder."]}),`
`,e.jsxs(n.li,{children:["Remove from your Build Path the exclusions on the ",e.jsx(n.em,{children:"src/main/resources"})," and ",e.jsx(n.em,{children:"src/test/resources"})," to avoid error message in the console, such as the following:",`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"Failed to execute goal"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"org.apache.maven.plugins:maven-antrun-plugin:1.6:run (default) on project hbase:"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"'An Ant BuildException has occurred: Replace: source file .../target/classes/hbase-default.xml"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"doesn't exist"})})]})})}),`
`,"This will also reduce the eclipse build cycles and make your life easier when developing."]}),`
`]}),`
`,e.jsx(n.h3,{id:"hbase-project-setup-in-eclipse-using-the-command-line",children:"HBase Project Setup in Eclipse Using the Command Line"}),`
`,e.jsxs(n.p,{children:["Instead of using ",e.jsx(n.code,{children:"m2eclipse"}),", you can generate the Eclipse files from the command line."]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[`
`,e.jsx(n.p,{children:`First, run the following command, which builds HBase.
You only need to do this once.`}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"mvn"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" clean"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" install"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -DskipTests"})]})})})}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsxs(n.p,{children:["Close Eclipse, and execute the following command from the terminal, in your local HBase project directory, to generate new ",e.jsx(n.em,{children:".project"})," and ",e.jsx(n.em,{children:".classpath"})," files."]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"mvn"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" eclipse:eclipse"})]})})})}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsxs(n.p,{children:["Reopen Eclipse and import the ",e.jsx(n.em,{children:".project"})," file in the HBase directory to a workspace."]}),`
`]}),`
`]}),`
`,e.jsx(n.h3,{id:"maven-classpath-variable",children:"Maven Classpath Variable"}),`
`,e.jsxs(n.p,{children:["The ",e.jsx(n.code,{children:"$M2_REPO"}),` classpath variable needs to be set up for the project.
This needs to be set to your local Maven repository, which is usually `,e.jsx(n.em,{children:"~/.m2/repository"})]}),`
`,e.jsx(n.p,{children:"If this classpath variable is not configured, you will see compile errors in Eclipse like this:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"Description        Resource        Path        Location        Type"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"The project cannot be built until build path errors are resolved        hbase                Unknown        Java Problem"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"Unbound classpath variable: 'M2_REPO/asm/asm/3.1/asm-3.1.jar' in project 'hbase'        hbase                Build path        Build Path Problem"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"Unbound classpath variable: 'M2_REPO/com/google/guava/guava/r09/guava-r09.jar' in project 'hbase'        hbase                Build path        Build Path Problem"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"Unbound classpath variable: 'M2_REPO/com/google/protobuf/protobuf-java/2.3.0/protobuf-java-2.3.0.jar' in project 'hbase'        hbase                Build path        Build Path Problem Unbound classpath variable:"})})]})})}),`
`,e.jsx(n.h3,{id:"eclipse-known-issues",children:"Eclipse Known Issues"}),`
`,e.jsxs(n.p,{children:["Eclipse will currently complain about ",e.jsx(n.em,{children:"Bytes.java"}),`.
It is not possible to turn these errors off.`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"Description        Resource        Path        Location        Type"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"Access restriction: The method arrayBaseOffset(Class) from the type Unsafe is not accessible due to restriction on required library /System/Library/Java/JavaVirtualMachines/1.6.0.jdk/Contents/Classes/classes.jar        Bytes.java        /hbase/src/main/java/org/apache/hadoop/hbase/util        line 1061        Java Problem"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"Access restriction: The method arrayIndexScale(Class) from the type Unsafe is not accessible due to restriction on required library /System/Library/Java/JavaVirtualMachines/1.6.0.jdk/Contents/Classes/classes.jar        Bytes.java        /hbase/src/main/java/org/apache/hadoop/hbase/util        line 1064        Java Problem"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{children:"Access restriction: The method getLong(Object, long) from the type Unsafe is not accessible due to restriction on required library /System/Library/Java/JavaVirtualMachines/1.6.0.jdk/Contents/Classes/classes.jar        Bytes.java        /hbase/src/main/java/org/apache/hadoop/hbase/util        line 1111        Java Problem"})})]})})}),`
`,e.jsx(n.h3,{id:"eclipse---more-information",children:"Eclipse - More Information"}),`
`,e.jsxs(n.p,{children:["For additional information on setting up Eclipse for HBase development on Windows, see ",e.jsx(n.a,{href:"http://michaelmorello.blogspot.com/2011/09/hbase-subversion-eclipse-windows.html",children:"Michael Morello's blog"})," on the topic."]}),`
`,e.jsx(n.h2,{id:"intellij-idea",children:"IntelliJ IDEA"}),`
`,e.jsx(n.p,{children:`A functional development environment can be setup around an IntelliJ IDEA installation that has the
plugins necessary for building Java projects with Maven.`}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:'Use either File > New > "Project from Existing Sources..." or "Project From Version Control.."'}),`
`,e.jsx(n.li,{children:`Depending on your version of IntelliJ, you may need to choose Maven as the "project" or "model"
type.`}),`
`]}),`
`,e.jsx(n.p,{children:"The following plugins are recommended:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Maven, bundled. This allows IntelliJ to resolve dependencies and recognize the project structure."}),`
`,e.jsxs(n.li,{children:[`EditorConfig, bundled. This will apply project whitespace settings found in the
`,e.jsx(n.code,{children:".editorconfig"}),` file available on branches with
`,e.jsx(n.a,{href:"https://issues.apache.org/jira/browse/HBASE-23234",children:"HBASE-23234"})," or later."]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.a,{href:"https://plugins.jetbrains.com/plugin/1065-checkstyle-idea/",children:"Checkstyle-IDEA"}),`. Configure this
against the configuration file found under `,e.jsx(n.code,{children:"hbase-checkstyle/src/main/resources/hbase/checkstyle.xml"}),`
(If the Intellij checkstyle plugin complains parsing the volunteered hbase `,e.jsx(n.code,{children:"checkstyle.xml"}),`, make
sure the plugin's `,e.jsx(n.code,{children:"version"}),` popup menu matches the hbase checkstyle version. Find the current
checkstyle version as a property in `,e.jsx(n.code,{children:"pom.xml"}),`.
This plugin will highlight style errors in the IDE, so you can fix them before they get flagged during the
pre-commit process.`]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.a,{href:"https://plugins.jetbrains.com/plugin/8277-protobuf-support/",children:"Protobuf Support"}),`. HBase uses
`,e.jsx(n.a,{href:"https://developers.google.com/protocol-buffers/",children:"Protocol Buffers"}),` in a number of places where
serialization is required. This plugin is helpful when editing these object definitions.`]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.a,{href:"https://plugins.jetbrains.com/plugin/14944-mdx",children:"MDX"}),`. HBase uses
`,e.jsx(n.a,{href:"https://mdxjs.com",children:"MDX"}),` (just extended markdown) for building it's project documentation. This plugin is helpful
when editing this book.`]}),`
`]}),`
`,e.jsx(n.h2,{id:"other-ides",children:"Other IDEs"}),`
`,e.jsx(n.p,{children:`If you'd have another environment with which you'd like to develop on HBase, please consider
documenting your setup process here.`})]})}function h(i={}){const{wrapper:n}=i.components||{};return n?e.jsx(n,{...i,children:e.jsx(s,{...i})}):s(i)}export{o as _markdown,h as default,a as extractedReferences,l as frontmatter,r as structuredData,c as toc};
