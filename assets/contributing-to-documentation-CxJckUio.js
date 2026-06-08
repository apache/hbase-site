import{j as e}from"./chunk-QUQL4437-Bywy9pC_.js";let d=`## Contributing to Documentation

The Apache HBase project welcomes contributions to all aspects of the project, including the documentation.

In HBase, documentation includes the following areas, and probably some others:

* The [HBase Reference Guide](/docs) (this book)
* The [HBase website](/)
* API documentation
* Command-line utility output and help text
* Web UI strings, explicit help text, context-sensitive strings, and others
* Log messages
* Comments in source files, configuration files, and others
* Localization of any of the above into target languages other than English

No matter which area you want to help out with, the first step is almost always to download (typically by cloning the Git repository) and familiarize yourself with the HBase source code. For information on downloading and building the source, see [developer](/docs/building-and-developing).

## Contributing to Other Strings

If you spot an error in a string in a UI, utility, script, log message, or elsewhere, or you think something could be made more clear, or you think text needs to be added where it doesn't currently exist, the first step is to file a JIRA. Be sure to set the component to \`Documentation\` in addition to any other involved components. Most components have one or more default owners, who monitor new issues which come into those queues. Regardless of whether you feel able to fix the bug, you should still file bugs where you see them.

If you want to try your hand at fixing your newly-filed bug, assign it to yourself. You will need to clone the HBase Git repository to your local system and work on the issue there. When you have developed a potential fix, submit it for review. If it addresses the issue and is seen as an improvement, one of the HBase committers will commit it to one or more branches, as appropriate.

### Procedure: Suggested Work flow for Submitting Patches

This procedure goes into more detail than Git pros will need, but is included in this appendix so that people unfamiliar with Git can feel confident contributing to HBase while they learn.

<Steps>
  <Step>
    If you have not already done so, clone the Git repository locally. You only need to do this once.
  </Step>

  <Step>
    Fairly often, pull remote changes into your local repository by using the \`git pull\` command,
    while your tracking branch is checked out.
  </Step>

  <Step>
    For each issue you work on, create a new branch. One convention that works well for naming the branches is to name a given branch the same as the JIRA it relates to:

    \`\`\`bash
    $ git checkout -b HBASE-123456
    \`\`\`
  </Step>

  <Step>
    Make your suggested changes on your branch, committing your changes to your local repository
    often. If you need to switch to working on a different issue, remember to check out the
    appropriate branch.
  </Step>

  <Step>
    When you are ready to submit your patch, first be sure that HBase builds cleanly and behaves as
    expected in your modified branch.
  </Step>

  <Step>
    If you have made documentation or website changes, verify that the site builds correctly by
    running the development server from the \`hbase-website/\` directory.
  </Step>

  <Step>
    If it takes you several days or weeks to implement your fix, or you know that the area of the code you are working in has had a lot of changes lately, make sure you rebase your branch against the remote master and take care of any conflicts before submitting your patch.

    \`\`\`bash
    $ git checkout HBASE-123456
    $ git rebase origin/master
    \`\`\`
  </Step>

  <Step>
    Generate your patch against the remote master. Run the following command from the top level of your git repository (usually called \`hbase\`):

    \`\`\`bash
    $ git format-patch --stdout origin/master > HBASE-123456.patch
    \`\`\`

    The name of the patch should contain the JIRA ID.
  </Step>

  <Step>
    Look over the patch file to be sure that you did not change any additional files by accident and
    that there are no other surprises.
  </Step>

  <Step>
    When you are satisfied, attach the patch to the JIRA and click the **Patch Available** button. A
    reviewer will review your patch.
  </Step>

  <Step>
    If you need to submit a new version of the patch, leave the old one on the JIRA and add a version
    number to the name of the new patch.
  </Step>

  <Step>
    After a change has been committed, there is no need to keep your local branch around.
  </Step>
</Steps>

## Editing the HBase Website and Documentation

The HBase website and documentation are now part of a single application built with Remix and Fumadocs. The source files are located in the \`hbase-website/\` directory:

* **Documentation pages**: \`hbase-website/app/pages/_docs/docs/_mdx/(multi-page)/\` - individual MDX files for each documentation section
* **Single-page view**: \`hbase-website/app/pages/_docs/docs/_mdx/single-page/index.mdx\` - combines all documentation into one page
* **Website components**: \`hbase-website/app/components/\` - React components used throughout the site
* **Images**: \`hbase-website/public/\` - static assets including images

You can edit MDX files in any text editor or IDE. To preview your changes locally, run the development server from the \`hbase-website/\` directory and navigate to the documentation pages in your browser. When you are satisfied with your changes, follow the procedure in [submit doc patch procedure](/docs/contributing-to-documentation#procedure-suggested-work-flow-for-submitting-patches) to submit your patch.

## Publishing the HBase Website and Documentation

The HBase website and documentation are built and deployed as a single Remix application. The deployment process is managed through the project's CI/CD pipeline, which builds the site from the \`hbase-website/\` directory and deploys it automatically when changes are merged to the main branch.

## MDX and Fumadocs Components

The HBase documentation is written in MDX (Markdown with JSX), which allows you to use standard Markdown syntax along with React components. For comprehensive documentation on Markdown formatting and MDX features, refer to:

* [Fumadocs Markdown Documentation](https://www.fumadocs.dev/docs/markdown) - Complete guide to MDX syntax and Fumadocs features
* [CommonMark specification](https://commonmark.org/) - Standard Markdown syntax reference
* [GFM (GitHub Flavored Markdown)](https://github.github.com/gfm) - GitHub-style Markdown extensions

### Fumadocs Components

Fumadocs provides several components that enhance the documentation:

#### Steps Component

Use \`<Steps>\` to create numbered step-by-step instructions:

\`\`\`mdx
<Steps>

<Step>First, do this thing.</Step>

<Step>Then, do this other thing.</Step>

</Steps>
\`\`\`

**Example output:**

<Steps>
  <Step>
    First, do this thing.
  </Step>

  <Step>
    Then, do this other thing.
  </Step>
</Steps>

#### Callout Component

Use \`<Callout>\` for notes, warnings, and important information:

\`\`\`mdx
<Callout type="info">This is an informational callout.</Callout>

<Callout type="warning">This is a warning callout.</Callout>
\`\`\`

**Example output:**

<Callout type="info">
  This is an informational callout.
</Callout>

<Callout type="warning">
  This is a warning callout.
</Callout>

#### Include Directive

The single-page documentation view uses \`<include>\` tags to combine multiple MDX files:

\`\`\`mdx
<include>../(multi-page)/getting-started.mdx</include>
\`\`\`

See \`hbase-website/app/pages/_docs/docs/_mdx/single-page/index.mdx\` for examples of how all documentation sections are included in the single-page view.

## Auto-Generated Content

Some parts of the HBase documentation, such as the [default configuration](/docs/configuration/default), are generated automatically to stay in sync with the code. The configuration documentation is generated from the \`hbase-common/src/main/resources/hbase-default.xml\` file.

To add or modify configuration parameters, update the source XML file. To regenerate the documentation from the updated configuration, run:

\`\`\`bash
npm run extract-hbase-config
\`\`\`

This command is also executed automatically when you run \`npm ci\`.

## Images in the Documentation

You can include images in the HBase documentation using standard Markdown syntax. Always include descriptive alt text for accessibility:

\`\`\`markdown
![Alt text describing the image](/path/to/image.png)
\`\`\`

Save images to the \`hbase-website/public/\` directory or an appropriate subdirectory. Reference them in your MDX files using absolute paths from the public directory:

\`\`\`markdown
![Architecture diagram](/images/architecture-diagram.png)
\`\`\`

When submitting a patch that includes images, attach the images to the JIRA issue.

## Adding a New Section to the Documentation

To add a new section to the HBase documentation:

1. Create a new MDX file in \`hbase-website/app/pages/_docs/docs/_mdx/(multi-page)/\` with a descriptive name (e.g., \`my-new-section.mdx\`)
2. Add frontmatter at the top of the file with a title and description:

\`\`\`mdx
---
title: "My New Section"
description: "Brief description of what this section covers"
---

## My New Section

Your content here...
\`\`\`

3. Add your new file to \`hbase-website/app/pages/_docs/docs/_mdx/(multi-page)/meta.json\` in the appropriate location within the \`pages\` array (without the \`.mdx\` extension):

\`\`\`json
{
  "pages": [
    "---My Category---",
    "my-new-section",
    ...
  ]
}
\`\`\`

4. Add an \`<include>\` directive to \`hbase-website/app/pages/_docs/docs/_mdx/single-page/index.mdx\` in the appropriate location:

\`\`\`mdx
<include>../(multi-page)/my-new-section.mdx</include>
\`\`\`

5. Add your new file to Git before creating your patch.

## Unique Headings Requirement

Since all documentation files are merged into a single-page view, **all heading IDs must be unique across the entire documentation**. A test will fail during the build if duplicate heading IDs are detected, marking the problematic headings.

Headings don't have to be visually unique, but their link IDs must be unique. You can customize the heading ID using Fumadocs syntax:

\`\`\`markdown
## Configuration [#server-configuration]
\`\`\`

This creates a heading that displays as "Configuration" but has the unique ID \`#server-configuration\` for linking purposes.

### Hiding Headings from Table of Contents

You can hide specific headings from the right-side table of contents:

\`\`\`markdown
## Internal Implementation Details [!toc]
\`\`\`

This heading will still appear in the document but won't show up in the table of contents navigation.

<Callout type="warning">
  Note: \`[!toc]\` becomes part of the heading ID. For example, \`## Usage [!toc]\` will have the ID
  \`#usage-toc\`.
</Callout>

### Combining Custom IDs and TOC Hiding

You can combine both attributes:

\`\`\`markdown
## Configuration Details [#server-config] [!toc]
\`\`\`

## Common Documentation Issues

The following documentation issues come up often:

1. **Isolate Changes for Easy Diff Review**

   Avoid reformatting entire files when making content changes. If you need to reformat a file, do that in a separate JIRA where you do not change any content.

2. **Syntax Highlighting**

   MDX supports syntax highlighting for code blocks. Specify the language after the opening triple backticks:

   \`\`\`\`markdown
   \`\`\`java
   public class Example {
       // your code here
   }
   \`\`\`
   \`\`\`\`

3. **Component Syntax**

   Remember to properly close Fumadocs components. Components like \`<Steps>\` and \`<Callout>\` must be properly closed:

   \`\`\`mdx
   <Callout>Your content here</Callout>
   \`\`\`

4. **Unique Heading IDs**

   Ensure all heading IDs are unique across the entire documentation. If you get a test failure about duplicate headings, customize the heading ID using \`[#custom-id]\` syntax as described in the [Unique Headings Requirement](#unique-headings-requirement) section.
`,l={title:"Appendix: Contributing to Documentation",description:"Guide for contributing to Apache HBase documentation, including patch submission procedures, website editing, style guidelines, and best practices."},c=[{href:"/docs"},{href:"/"},{href:"/docs/building-and-developing"},{href:"/docs/contributing-to-documentation#procedure-suggested-work-flow-for-submitting-patches"},{href:"https://www.fumadocs.dev/docs/markdown"},{href:"https://commonmark.org/"},{href:"https://github.github.com/gfm"},{href:"/docs/configuration/default"},{href:"#unique-headings-requirement"}],u={contents:[{heading:"appendix-contributing-to-documentation",content:"The Apache HBase project welcomes contributions to all aspects of the project, including the documentation."},{heading:"appendix-contributing-to-documentation",content:"In HBase, documentation includes the following areas, and probably some others:"},{heading:"appendix-contributing-to-documentation",content:"The HBase Reference Guide (this book)"},{heading:"appendix-contributing-to-documentation",content:"The HBase website"},{heading:"appendix-contributing-to-documentation",content:"API documentation"},{heading:"appendix-contributing-to-documentation",content:"Command-line utility output and help text"},{heading:"appendix-contributing-to-documentation",content:"Web UI strings, explicit help text, context-sensitive strings, and others"},{heading:"appendix-contributing-to-documentation",content:"Log messages"},{heading:"appendix-contributing-to-documentation",content:"Comments in source files, configuration files, and others"},{heading:"appendix-contributing-to-documentation",content:"Localization of any of the above into target languages other than English"},{heading:"appendix-contributing-to-documentation",content:"No matter which area you want to help out with, the first step is almost always to download (typically by cloning the Git repository) and familiarize yourself with the HBase source code. For information on downloading and building the source, see developer."},{heading:"contributing-to-other-strings",content:"If you spot an error in a string in a UI, utility, script, log message, or elsewhere, or you think something could be made more clear, or you think text needs to be added where it doesn't currently exist, the first step is to file a JIRA. Be sure to set the component to Documentation in addition to any other involved components. Most components have one or more default owners, who monitor new issues which come into those queues. Regardless of whether you feel able to fix the bug, you should still file bugs where you see them."},{heading:"contributing-to-other-strings",content:"If you want to try your hand at fixing your newly-filed bug, assign it to yourself. You will need to clone the HBase Git repository to your local system and work on the issue there. When you have developed a potential fix, submit it for review. If it addresses the issue and is seen as an improvement, one of the HBase committers will commit it to one or more branches, as appropriate."},{heading:"procedure-suggested-work-flow-for-submitting-patches",content:"This procedure goes into more detail than Git pros will need, but is included in this appendix so that people unfamiliar with Git can feel confident contributing to HBase while they learn."},{heading:"procedure-suggested-work-flow-for-submitting-patches",content:"If you have not already done so, clone the Git repository locally. You only need to do this once."},{heading:"procedure-suggested-work-flow-for-submitting-patches",content:`Fairly often, pull remote changes into your local repository by using the git pull command,
while your tracking branch is checked out.`},{heading:"procedure-suggested-work-flow-for-submitting-patches",content:"For each issue you work on, create a new branch. One convention that works well for naming the branches is to name a given branch the same as the JIRA it relates to:"},{heading:"procedure-suggested-work-flow-for-submitting-patches",content:`Make your suggested changes on your branch, committing your changes to your local repository
often. If you need to switch to working on a different issue, remember to check out the
appropriate branch.`},{heading:"procedure-suggested-work-flow-for-submitting-patches",content:`When you are ready to submit your patch, first be sure that HBase builds cleanly and behaves as
expected in your modified branch.`},{heading:"procedure-suggested-work-flow-for-submitting-patches",content:`If you have made documentation or website changes, verify that the site builds correctly by
running the development server from the hbase-website/ directory.`},{heading:"procedure-suggested-work-flow-for-submitting-patches",content:"If it takes you several days or weeks to implement your fix, or you know that the area of the code you are working in has had a lot of changes lately, make sure you rebase your branch against the remote master and take care of any conflicts before submitting your patch."},{heading:"procedure-suggested-work-flow-for-submitting-patches",content:"Generate your patch against the remote master. Run the following command from the top level of your git repository (usually called hbase):"},{heading:"procedure-suggested-work-flow-for-submitting-patches",content:"The name of the patch should contain the JIRA ID."},{heading:"procedure-suggested-work-flow-for-submitting-patches",content:`Look over the patch file to be sure that you did not change any additional files by accident and
that there are no other surprises.`},{heading:"procedure-suggested-work-flow-for-submitting-patches",content:`When you are satisfied, attach the patch to the JIRA and click the Patch Available button. A
reviewer will review your patch.`},{heading:"procedure-suggested-work-flow-for-submitting-patches",content:`If you need to submit a new version of the patch, leave the old one on the JIRA and add a version
number to the name of the new patch.`},{heading:"editing-the-hbase-website-and-documentation",content:"The HBase website and documentation are now part of a single application built with Remix and Fumadocs. The source files are located in the hbase-website/ directory:"},{heading:"editing-the-hbase-website-and-documentation",content:"Documentation pages: hbase-website/app/pages/_docs/docs/_mdx/(multi-page)/ - individual MDX files for each documentation section"},{heading:"editing-the-hbase-website-and-documentation",content:"Single-page view: hbase-website/app/pages/_docs/docs/_mdx/single-page/index.mdx - combines all documentation into one page"},{heading:"editing-the-hbase-website-and-documentation",content:"Website components: hbase-website/app/components/ - React components used throughout the site"},{heading:"editing-the-hbase-website-and-documentation",content:"Images: hbase-website/public/ - static assets including images"},{heading:"editing-the-hbase-website-and-documentation",content:"You can edit MDX files in any text editor or IDE. To preview your changes locally, run the development server from the hbase-website/ directory and navigate to the documentation pages in your browser. When you are satisfied with your changes, follow the procedure in submit doc patch procedure to submit your patch."},{heading:"publishing-the-hbase-website-and-documentation",content:"The HBase website and documentation are built and deployed as a single Remix application. The deployment process is managed through the project's CI/CD pipeline, which builds the site from the hbase-website/ directory and deploys it automatically when changes are merged to the main branch."},{heading:"mdx-and-fumadocs-components",content:"The HBase documentation is written in MDX (Markdown with JSX), which allows you to use standard Markdown syntax along with React components. For comprehensive documentation on Markdown formatting and MDX features, refer to:"},{heading:"mdx-and-fumadocs-components",content:"Fumadocs Markdown Documentation - Complete guide to MDX syntax and Fumadocs features"},{heading:"mdx-and-fumadocs-components",content:"CommonMark specification - Standard Markdown syntax reference"},{heading:"mdx-and-fumadocs-components",content:"GFM (GitHub Flavored Markdown) - GitHub-style Markdown extensions"},{heading:"fumadocs-components",content:"Fumadocs provides several components that enhance the documentation:"},{heading:"steps-component",content:"Use <Steps> to create numbered step-by-step instructions:"},{heading:"steps-component",content:"Example output:"},{heading:"callout-component",content:"Use <Callout> for notes, warnings, and important information:"},{heading:"callout-component",content:"Example output:"},{heading:"callout-component",content:"type: info"},{heading:"callout-component",content:"type: warning"},{heading:"include-directive",content:"The single-page documentation view uses <include> tags to combine multiple MDX files:"},{heading:"include-directive",content:"See hbase-website/app/pages/_docs/docs/_mdx/single-page/index.mdx for examples of how all documentation sections are included in the single-page view."},{heading:"auto-generated-content",content:"Some parts of the HBase documentation, such as the default configuration, are generated automatically to stay in sync with the code. The configuration documentation is generated from the hbase-common/src/main/resources/hbase-default.xml file."},{heading:"auto-generated-content",content:"To add or modify configuration parameters, update the source XML file. To regenerate the documentation from the updated configuration, run:"},{heading:"auto-generated-content",content:"This command is also executed automatically when you run npm ci."},{heading:"images-in-the-documentation",content:"You can include images in the HBase documentation using standard Markdown syntax. Always include descriptive alt text for accessibility:"},{heading:"images-in-the-documentation",content:"Save images to the hbase-website/public/ directory or an appropriate subdirectory. Reference them in your MDX files using absolute paths from the public directory:"},{heading:"images-in-the-documentation",content:"When submitting a patch that includes images, attach the images to the JIRA issue."},{heading:"adding-a-new-section-to-the-documentation",content:"To add a new section to the HBase documentation:"},{heading:"adding-a-new-section-to-the-documentation",content:"Create a new MDX file in hbase-website/app/pages/_docs/docs/_mdx/(multi-page)/ with a descriptive name (e.g., my-new-section.mdx)"},{heading:"adding-a-new-section-to-the-documentation",content:"Add frontmatter at the top of the file with a title and description:"},{heading:"adding-a-new-section-to-the-documentation",content:"Add your new file to hbase-website/app/pages/_docs/docs/_mdx/(multi-page)/meta.json in the appropriate location within the pages array (without the .mdx extension):"},{heading:"adding-a-new-section-to-the-documentation",content:"Add an <include> directive to hbase-website/app/pages/_docs/docs/_mdx/single-page/index.mdx in the appropriate location:"},{heading:"adding-a-new-section-to-the-documentation",content:"Add your new file to Git before creating your patch."},{heading:"unique-headings-requirement",content:"Since all documentation files are merged into a single-page view, all heading IDs must be unique across the entire documentation. A test will fail during the build if duplicate heading IDs are detected, marking the problematic headings."},{heading:"unique-headings-requirement",content:"Headings don't have to be visually unique, but their link IDs must be unique. You can customize the heading ID using Fumadocs syntax:"},{heading:"unique-headings-requirement",content:'This creates a heading that displays as "Configuration" but has the unique ID #server-configuration for linking purposes.'},{heading:"hiding-headings-from-table-of-contents",content:"You can hide specific headings from the right-side table of contents:"},{heading:"hiding-headings-from-table-of-contents",content:"This heading will still appear in the document but won't show up in the table of contents navigation."},{heading:"hiding-headings-from-table-of-contents",content:"type: warning"},{heading:"hiding-headings-from-table-of-contents",content:`Note: [!toc] becomes part of the heading ID. For example, ## Usage [!toc] will have the ID
#usage-toc.`},{heading:"combining-custom-ids-and-toc-hiding",content:"You can combine both attributes:"},{heading:"common-documentation-issues",content:"The following documentation issues come up often:"},{heading:"common-documentation-issues",content:"Isolate Changes for Easy Diff Review"},{heading:"common-documentation-issues",content:"Avoid reformatting entire files when making content changes. If you need to reformat a file, do that in a separate JIRA where you do not change any content."},{heading:"common-documentation-issues",content:"Syntax Highlighting"},{heading:"common-documentation-issues",content:"MDX supports syntax highlighting for code blocks. Specify the language after the opening triple backticks:"},{heading:"common-documentation-issues",content:"Component Syntax"},{heading:"common-documentation-issues",content:"Remember to properly close Fumadocs components. Components like <Steps> and <Callout> must be properly closed:"},{heading:"common-documentation-issues",content:"Unique Heading IDs"},{heading:"common-documentation-issues",content:"Ensure all heading IDs are unique across the entire documentation. If you get a test failure about duplicate headings, customize the heading ID using [#custom-id] syntax as described in the Unique Headings Requirement section."}],headings:[{id:"appendix-contributing-to-documentation",content:"Contributing to Documentation"},{id:"contributing-to-other-strings",content:"Contributing to Other Strings"},{id:"procedure-suggested-work-flow-for-submitting-patches",content:"Procedure: Suggested Work flow for Submitting Patches"},{id:"editing-the-hbase-website-and-documentation",content:"Editing the HBase Website and Documentation"},{id:"publishing-the-hbase-website-and-documentation",content:"Publishing the HBase Website and Documentation"},{id:"mdx-and-fumadocs-components",content:"MDX and Fumadocs Components"},{id:"fumadocs-components",content:"Fumadocs Components"},{id:"steps-component",content:"Steps Component"},{id:"callout-component",content:"Callout Component"},{id:"include-directive",content:"Include Directive"},{id:"auto-generated-content",content:"Auto-Generated Content"},{id:"images-in-the-documentation",content:"Images in the Documentation"},{id:"adding-a-new-section-to-the-documentation",content:"Adding a New Section to the Documentation"},{id:"unique-headings-requirement",content:"Unique Headings Requirement"},{id:"hiding-headings-from-table-of-contents",content:"Hiding Headings from Table of Contents"},{id:"combining-custom-ids-and-toc-hiding",content:"Combining Custom IDs and TOC Hiding"},{id:"common-documentation-issues",content:"Common Documentation Issues"}]};const g=[{depth:2,url:"#appendix-contributing-to-documentation",title:e.jsx(e.Fragment,{children:"Contributing to Documentation"})},{depth:2,url:"#contributing-to-other-strings",title:e.jsx(e.Fragment,{children:"Contributing to Other Strings"})},{depth:3,url:"#procedure-suggested-work-flow-for-submitting-patches",title:e.jsx(e.Fragment,{children:"Procedure: Suggested Work flow for Submitting Patches"})},{depth:2,url:"#editing-the-hbase-website-and-documentation",title:e.jsx(e.Fragment,{children:"Editing the HBase Website and Documentation"})},{depth:2,url:"#publishing-the-hbase-website-and-documentation",title:e.jsx(e.Fragment,{children:"Publishing the HBase Website and Documentation"})},{depth:2,url:"#mdx-and-fumadocs-components",title:e.jsx(e.Fragment,{children:"MDX and Fumadocs Components"})},{depth:3,url:"#fumadocs-components",title:e.jsx(e.Fragment,{children:"Fumadocs Components"})},{depth:4,url:"#steps-component",title:e.jsx(e.Fragment,{children:"Steps Component"})},{depth:4,url:"#callout-component",title:e.jsx(e.Fragment,{children:"Callout Component"})},{depth:4,url:"#include-directive",title:e.jsx(e.Fragment,{children:"Include Directive"})},{depth:2,url:"#auto-generated-content",title:e.jsx(e.Fragment,{children:"Auto-Generated Content"})},{depth:2,url:"#images-in-the-documentation",title:e.jsx(e.Fragment,{children:"Images in the Documentation"})},{depth:2,url:"#adding-a-new-section-to-the-documentation",title:e.jsx(e.Fragment,{children:"Adding a New Section to the Documentation"})},{depth:2,url:"#unique-headings-requirement",title:e.jsx(e.Fragment,{children:"Unique Headings Requirement"})},{depth:3,url:"#hiding-headings-from-table-of-contents",title:e.jsx(e.Fragment,{children:"Hiding Headings from Table of Contents"})},{depth:3,url:"#combining-custom-ids-and-toc-hiding",title:e.jsx(e.Fragment,{children:"Combining Custom IDs and TOC Hiding"})},{depth:2,url:"#common-documentation-issues",title:e.jsx(e.Fragment,{children:"Common Documentation Issues"})}];function h(t){const n={a:"a",code:"code",h2:"h2",h3:"h3",h4:"h4",li:"li",ol:"ol",p:"p",pre:"pre",span:"span",strong:"strong",ul:"ul",...t.components},{Callout:s,Step:i,Steps:o}=n;return s||a("Callout"),i||a("Step"),o||a("Steps"),e.jsxs(e.Fragment,{children:[e.jsx(n.h2,{id:"appendix-contributing-to-documentation",children:"Contributing to Documentation"}),`
`,e.jsx(n.p,{children:"The Apache HBase project welcomes contributions to all aspects of the project, including the documentation."}),`
`,e.jsx(n.p,{children:"In HBase, documentation includes the following areas, and probably some others:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["The ",e.jsx(n.a,{href:"/docs",children:"HBase Reference Guide"})," (this book)"]}),`
`,e.jsxs(n.li,{children:["The ",e.jsx(n.a,{href:"/",children:"HBase website"})]}),`
`,e.jsx(n.li,{children:"API documentation"}),`
`,e.jsx(n.li,{children:"Command-line utility output and help text"}),`
`,e.jsx(n.li,{children:"Web UI strings, explicit help text, context-sensitive strings, and others"}),`
`,e.jsx(n.li,{children:"Log messages"}),`
`,e.jsx(n.li,{children:"Comments in source files, configuration files, and others"}),`
`,e.jsx(n.li,{children:"Localization of any of the above into target languages other than English"}),`
`]}),`
`,e.jsxs(n.p,{children:["No matter which area you want to help out with, the first step is almost always to download (typically by cloning the Git repository) and familiarize yourself with the HBase source code. For information on downloading and building the source, see ",e.jsx(n.a,{href:"/docs/building-and-developing",children:"developer"}),"."]}),`
`,e.jsx(n.h2,{id:"contributing-to-other-strings",children:"Contributing to Other Strings"}),`
`,e.jsxs(n.p,{children:["If you spot an error in a string in a UI, utility, script, log message, or elsewhere, or you think something could be made more clear, or you think text needs to be added where it doesn't currently exist, the first step is to file a JIRA. Be sure to set the component to ",e.jsx(n.code,{children:"Documentation"})," in addition to any other involved components. Most components have one or more default owners, who monitor new issues which come into those queues. Regardless of whether you feel able to fix the bug, you should still file bugs where you see them."]}),`
`,e.jsx(n.p,{children:"If you want to try your hand at fixing your newly-filed bug, assign it to yourself. You will need to clone the HBase Git repository to your local system and work on the issue there. When you have developed a potential fix, submit it for review. If it addresses the issue and is seen as an improvement, one of the HBase committers will commit it to one or more branches, as appropriate."}),`
`,e.jsx(n.h3,{id:"procedure-suggested-work-flow-for-submitting-patches",children:"Procedure: Suggested Work flow for Submitting Patches"}),`
`,e.jsx(n.p,{children:"This procedure goes into more detail than Git pros will need, but is included in this appendix so that people unfamiliar with Git can feel confident contributing to HBase while they learn."}),`
`,e.jsxs(o,{children:[e.jsx(i,{children:e.jsx(n.p,{children:"If you have not already done so, clone the Git repository locally. You only need to do this once."})}),e.jsx(i,{children:e.jsxs(n.p,{children:["Fairly often, pull remote changes into your local repository by using the ",e.jsx(n.code,{children:"git pull"}),` command,
while your tracking branch is checked out.`]})}),e.jsxs(i,{children:[e.jsx(n.p,{children:"For each issue you work on, create a new branch. One convention that works well for naming the branches is to name a given branch the same as the JIRA it relates to:"}),e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" git"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" checkout"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" -b"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" HBASE-123456"})]})})})})]}),e.jsx(i,{children:e.jsx(n.p,{children:`Make your suggested changes on your branch, committing your changes to your local repository
often. If you need to switch to working on a different issue, remember to check out the
appropriate branch.`})}),e.jsx(i,{children:e.jsx(n.p,{children:`When you are ready to submit your patch, first be sure that HBase builds cleanly and behaves as
expected in your modified branch.`})}),e.jsx(i,{children:e.jsxs(n.p,{children:[`If you have made documentation or website changes, verify that the site builds correctly by
running the development server from the `,e.jsx(n.code,{children:"hbase-website/"})," directory."]})}),e.jsxs(i,{children:[e.jsx(n.p,{children:"If it takes you several days or weeks to implement your fix, or you know that the area of the code you are working in has had a lot of changes lately, make sure you rebase your branch against the remote master and take care of any conflicts before submitting your patch."}),e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" git"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" checkout"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" HBASE-123456"})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" git"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" rebase"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" origin/master"})]})]})})})]}),e.jsxs(i,{children:[e.jsxs(n.p,{children:["Generate your patch against the remote master. Run the following command from the top level of your git repository (usually called ",e.jsx(n.code,{children:"hbase"}),"):"]}),e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"$"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" git"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" format-patch"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:" --stdout"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" origin/master"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:" >"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" HBASE-123456.patch"})]})})})}),e.jsx(n.p,{children:"The name of the patch should contain the JIRA ID."})]}),e.jsx(i,{children:e.jsx(n.p,{children:`Look over the patch file to be sure that you did not change any additional files by accident and
that there are no other surprises.`})}),e.jsx(i,{children:e.jsxs(n.p,{children:["When you are satisfied, attach the patch to the JIRA and click the ",e.jsx(n.strong,{children:"Patch Available"}),` button. A
reviewer will review your patch.`]})}),e.jsx(i,{children:e.jsx(n.p,{children:`If you need to submit a new version of the patch, leave the old one on the JIRA and add a version
number to the name of the new patch.`})}),e.jsx(i,{children:"After a change has been committed, there is no need to keep your local branch around."})]}),`
`,e.jsx(n.h2,{id:"editing-the-hbase-website-and-documentation",children:"Editing the HBase Website and Documentation"}),`
`,e.jsxs(n.p,{children:["The HBase website and documentation are now part of a single application built with Remix and Fumadocs. The source files are located in the ",e.jsx(n.code,{children:"hbase-website/"})," directory:"]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Documentation pages"}),": ",e.jsx(n.code,{children:"hbase-website/app/pages/_docs/docs/_mdx/(multi-page)/"})," - individual MDX files for each documentation section"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Single-page view"}),": ",e.jsx(n.code,{children:"hbase-website/app/pages/_docs/docs/_mdx/single-page/index.mdx"})," - combines all documentation into one page"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Website components"}),": ",e.jsx(n.code,{children:"hbase-website/app/components/"})," - React components used throughout the site"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Images"}),": ",e.jsx(n.code,{children:"hbase-website/public/"})," - static assets including images"]}),`
`]}),`
`,e.jsxs(n.p,{children:["You can edit MDX files in any text editor or IDE. To preview your changes locally, run the development server from the ",e.jsx(n.code,{children:"hbase-website/"})," directory and navigate to the documentation pages in your browser. When you are satisfied with your changes, follow the procedure in ",e.jsx(n.a,{href:"/docs/contributing-to-documentation#procedure-suggested-work-flow-for-submitting-patches",children:"submit doc patch procedure"})," to submit your patch."]}),`
`,e.jsx(n.h2,{id:"publishing-the-hbase-website-and-documentation",children:"Publishing the HBase Website and Documentation"}),`
`,e.jsxs(n.p,{children:["The HBase website and documentation are built and deployed as a single Remix application. The deployment process is managed through the project's CI/CD pipeline, which builds the site from the ",e.jsx(n.code,{children:"hbase-website/"})," directory and deploys it automatically when changes are merged to the main branch."]}),`
`,e.jsx(n.h2,{id:"mdx-and-fumadocs-components",children:"MDX and Fumadocs Components"}),`
`,e.jsx(n.p,{children:"The HBase documentation is written in MDX (Markdown with JSX), which allows you to use standard Markdown syntax along with React components. For comprehensive documentation on Markdown formatting and MDX features, refer to:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.a,{href:"https://www.fumadocs.dev/docs/markdown",children:"Fumadocs Markdown Documentation"})," - Complete guide to MDX syntax and Fumadocs features"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.a,{href:"https://commonmark.org/",children:"CommonMark specification"})," - Standard Markdown syntax reference"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.a,{href:"https://github.github.com/gfm",children:"GFM (GitHub Flavored Markdown)"})," - GitHub-style Markdown extensions"]}),`
`]}),`
`,e.jsx(n.h3,{id:"fumadocs-components",children:"Fumadocs Components"}),`
`,e.jsx(n.p,{children:"Fumadocs provides several components that enhance the documentation:"}),`
`,e.jsx(n.h4,{id:"steps-component",children:"Steps Component"}),`
`,e.jsxs(n.p,{children:["Use ",e.jsx(n.code,{children:"<Steps>"})," to create numbered step-by-step instructions:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Steps"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsx(n.span,{className:"line"}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Step"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">First, do this thing.</"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Step"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsx(n.span,{className:"line"}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Step"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">Then, do this other thing.</"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Step"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsx(n.span,{className:"line"}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"</"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Steps"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]})]})})}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Example output:"})}),`
`,e.jsxs(o,{children:[e.jsx(i,{children:"First, do this thing."}),e.jsx(i,{children:"Then, do this other thing."})]}),`
`,e.jsx(n.h4,{id:"callout-component",children:"Callout Component"}),`
`,e.jsxs(n.p,{children:["Use ",e.jsx(n.code,{children:"<Callout>"})," for notes, warnings, and important information:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Callout"}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" type"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"info"'}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">This is an informational callout.</"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Callout"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]}),`
`,e.jsx(n.span,{className:"line"}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Callout"}),e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:" type"}),e.jsx(n.span,{style:{"--shiki-light":"#D73A49","--shiki-dark":"#F97583"},children:"="}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'"warning"'}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">This is a warning callout.</"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Callout"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]})]})})}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Example output:"})}),`
`,e.jsx(s,{type:"info",children:"This is an informational callout."}),`
`,e.jsx(s,{type:"warning",children:"This is a warning callout."}),`
`,e.jsx(n.h4,{id:"include-directive",children:"Include Directive"}),`
`,e.jsxs(n.p,{children:["The single-page documentation view uses ",e.jsx(n.code,{children:"<include>"})," tags to combine multiple MDX files:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"include"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">../(multi-page)/getting-started.mdx</"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"include"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]})})})}),`
`,e.jsxs(n.p,{children:["See ",e.jsx(n.code,{children:"hbase-website/app/pages/_docs/docs/_mdx/single-page/index.mdx"})," for examples of how all documentation sections are included in the single-page view."]}),`
`,e.jsx(n.h2,{id:"auto-generated-content",children:"Auto-Generated Content"}),`
`,e.jsxs(n.p,{children:["Some parts of the HBase documentation, such as the ",e.jsx(n.a,{href:"/docs/configuration/default",children:"default configuration"}),", are generated automatically to stay in sync with the code. The configuration documentation is generated from the ",e.jsx(n.code,{children:"hbase-common/src/main/resources/hbase-default.xml"})," file."]}),`
`,e.jsx(n.p,{children:"To add or modify configuration parameters, update the source XML file. To regenerate the documentation from the updated configuration, run:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="m 4,4 a 1,1 0 0 0 -0.7070312,0.2929687 1,1 0 0 0 0,1.4140625 L 8.5859375,11 3.2929688,16.292969 a 1,1 0 0 0 0,1.414062 1,1 0 0 0 1.4140624,0 l 5.9999998,-6 a 1.0001,1.0001 0 0 0 0,-1.414062 L 4.7070312,4.2929687 A 1,1 0 0 0 4,4 Z m 8,14 a 1,1 0 0 0 -1,1 1,1 0 0 0 1,1 h 8 a 1,1 0 0 0 1,-1 1,1 0 0 0 -1,-1 z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#6F42C1","--shiki-dark":"#B392F0"},children:"npm"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" run"}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:" extract-hbase-config"})]})})})}),`
`,e.jsxs(n.p,{children:["This command is also executed automatically when you run ",e.jsx(n.code,{children:"npm ci"}),"."]}),`
`,e.jsx(n.h2,{id:"images-in-the-documentation",children:"Images in the Documentation"}),`
`,e.jsx(n.p,{children:"You can include images in the HBase documentation using standard Markdown syntax. Always include descriptive alt text for accessibility:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"!["}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-light-text-decoration":"underline","--shiki-dark":"#DBEDFF","--shiki-dark-text-decoration":"underline"},children:"Alt text describing the image"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"]("}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-light-text-decoration":"underline","--shiki-dark":"#E1E4E8","--shiki-dark-text-decoration":"underline"},children:"/path/to/image.png"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]})})})}),`
`,e.jsxs(n.p,{children:["Save images to the ",e.jsx(n.code,{children:"hbase-website/public/"})," directory or an appropriate subdirectory. Reference them in your MDX files using absolute paths from the public directory:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"!["}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-light-text-decoration":"underline","--shiki-dark":"#DBEDFF","--shiki-dark-text-decoration":"underline"},children:"Architecture diagram"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"]("}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-light-text-decoration":"underline","--shiki-dark":"#E1E4E8","--shiki-dark-text-decoration":"underline"},children:"/images/architecture-diagram.png"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:")"})]})})})}),`
`,e.jsx(n.p,{children:"When submitting a patch that includes images, attach the images to the JIRA issue."}),`
`,e.jsx(n.h2,{id:"adding-a-new-section-to-the-documentation",children:"Adding a New Section to the Documentation"}),`
`,e.jsx(n.p,{children:"To add a new section to the HBase documentation:"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:["Create a new MDX file in ",e.jsx(n.code,{children:"hbase-website/app/pages/_docs/docs/_mdx/(multi-page)/"})," with a descriptive name (e.g., ",e.jsx(n.code,{children:"my-new-section.mdx"}),")"]}),`
`,e.jsx(n.li,{children:"Add frontmatter at the top of the file with a title and description:"}),`
`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-light-font-weight":"bold","--shiki-dark":"#79B8FF","--shiki-dark-font-weight":"bold"},children:"---"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:'title: "My New Section"'})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:'description: "Brief description of what this section covers"'})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-light-font-weight":"bold","--shiki-dark":"#79B8FF","--shiki-dark-font-weight":"bold"},children:"---"})}),`
`,e.jsx(n.span,{className:"line"}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-light-font-weight":"bold","--shiki-dark":"#79B8FF","--shiki-dark-font-weight":"bold"},children:"## My New Section"})}),`
`,e.jsx(n.span,{className:"line"}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"Your content here..."})})]})})}),`
`,e.jsxs(n.ol,{start:"3",children:[`
`,e.jsxs(n.li,{children:["Add your new file to ",e.jsx(n.code,{children:"hbase-website/app/pages/_docs/docs/_mdx/(multi-page)/meta.json"})," in the appropriate location within the ",e.jsx(n.code,{children:"pages"})," array (without the ",e.jsx(n.code,{children:".mdx"})," extension):"]}),`
`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"{"})}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:'  "pages"'}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:": ["})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'    "---My Category---"'}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-dark":"#9ECBFF"},children:'    "my-new-section"'}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:","})]}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#B31D28","--shiki-light-font-style":"italic","--shiki-dark":"#FDAEB7","--shiki-dark-font-style":"italic"},children:"    ..."})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"  ]"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})})]})})}),`
`,e.jsxs(n.ol,{start:"4",children:[`
`,e.jsxs(n.li,{children:["Add an ",e.jsx(n.code,{children:"<include>"})," directive to ",e.jsx(n.code,{children:"hbase-website/app/pages/_docs/docs/_mdx/single-page/index.mdx"})," in the appropriate location:"]}),`
`]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"include"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">../(multi-page)/my-new-section.mdx</"}),e.jsx(n.span,{style:{"--shiki-light":"#22863A","--shiki-dark":"#85E89D"},children:"include"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]})})})}),`
`,e.jsxs(n.ol,{start:"5",children:[`
`,e.jsx(n.li,{children:"Add your new file to Git before creating your patch."}),`
`]}),`
`,e.jsx(n.h2,{id:"unique-headings-requirement",children:"Unique Headings Requirement"}),`
`,e.jsxs(n.p,{children:["Since all documentation files are merged into a single-page view, ",e.jsx(n.strong,{children:"all heading IDs must be unique across the entire documentation"}),". A test will fail during the build if duplicate heading IDs are detected, marking the problematic headings."]}),`
`,e.jsx(n.p,{children:"Headings don't have to be visually unique, but their link IDs must be unique. You can customize the heading ID using Fumadocs syntax:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-light-font-weight":"bold","--shiki-dark":"#79B8FF","--shiki-dark-font-weight":"bold"},children:"## Configuration ["}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-light-text-decoration":"underline","--shiki-dark":"#DBEDFF","--shiki-dark-text-decoration":"underline"},children:"#server-configuration"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-light-font-weight":"bold","--shiki-dark":"#79B8FF","--shiki-dark-font-weight":"bold"},children:"]"})]})})})}),`
`,e.jsxs(n.p,{children:['This creates a heading that displays as "Configuration" but has the unique ID ',e.jsx(n.code,{children:"#server-configuration"})," for linking purposes."]}),`
`,e.jsx(n.h3,{id:"hiding-headings-from-table-of-contents",children:"Hiding Headings from Table of Contents"}),`
`,e.jsx(n.p,{children:"You can hide specific headings from the right-side table of contents:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-light-font-weight":"bold","--shiki-dark":"#79B8FF","--shiki-dark-font-weight":"bold"},children:"## Internal Implementation Details ["}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-light-text-decoration":"underline","--shiki-dark":"#DBEDFF","--shiki-dark-text-decoration":"underline"},children:"!toc"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-light-font-weight":"bold","--shiki-dark":"#79B8FF","--shiki-dark-font-weight":"bold"},children:"]"})]})})})}),`
`,e.jsx(n.p,{children:"This heading will still appear in the document but won't show up in the table of contents navigation."}),`
`,e.jsx(s,{type:"warning",children:e.jsxs(n.p,{children:["Note: ",e.jsx(n.code,{children:"[!toc]"})," becomes part of the heading ID. For example, ",e.jsx(n.code,{children:"## Usage [!toc]"}),` will have the ID
`,e.jsx(n.code,{children:"#usage-toc"}),"."]})}),`
`,e.jsx(n.h3,{id:"combining-custom-ids-and-toc-hiding",children:"Combining Custom IDs and TOC Hiding"}),`
`,e.jsx(n.p,{children:"You can combine both attributes:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-light-font-weight":"bold","--shiki-dark":"#79B8FF","--shiki-dark-font-weight":"bold"},children:"## Configuration Details ["}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-light-text-decoration":"underline","--shiki-dark":"#DBEDFF","--shiki-dark-text-decoration":"underline"},children:"#server-config"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-light-font-weight":"bold","--shiki-dark":"#79B8FF","--shiki-dark-font-weight":"bold"},children:"] ["}),e.jsx(n.span,{style:{"--shiki-light":"#032F62","--shiki-light-text-decoration":"underline","--shiki-dark":"#DBEDFF","--shiki-dark-text-decoration":"underline"},children:"!toc"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-light-font-weight":"bold","--shiki-dark":"#79B8FF","--shiki-dark-font-weight":"bold"},children:"]"})]})})})}),`
`,e.jsx(n.h2,{id:"common-documentation-issues",children:"Common Documentation Issues"}),`
`,e.jsx(n.p,{children:"The following documentation issues come up often:"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:[`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Isolate Changes for Easy Diff Review"})}),`
`,e.jsx(n.p,{children:"Avoid reformatting entire files when making content changes. If you need to reformat a file, do that in a separate JIRA where you do not change any content."}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Syntax Highlighting"})}),`
`,e.jsx(n.p,{children:"MDX supports syntax highlighting for code blocks. Specify the language after the opening triple backticks:"}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsxs(n.code,{children:[e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"```java"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"public class Example {"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"    // your code here"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"}"})}),`
`,e.jsx(n.span,{className:"line",children:e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"```"})})]})})}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Component Syntax"})}),`
`,e.jsxs(n.p,{children:["Remember to properly close Fumadocs components. Components like ",e.jsx(n.code,{children:"<Steps>"})," and ",e.jsx(n.code,{children:"<Callout>"})," must be properly closed:"]}),`
`,e.jsx(e.Fragment,{children:e.jsx(n.pre,{className:"shiki shiki-themes github-light github-dark",style:{"--shiki-light":"#24292e","--shiki-dark":"#e1e4e8","--shiki-light-bg":"#fff","--shiki-dark-bg":"#24292e"},tabIndex:"0",icon:'<svg viewBox="0 0 24 24"><path d="M 6,1 C 4.354992,1 3,2.354992 3,4 v 16 c 0,1.645008 1.354992,3 3,3 h 12 c 1.645008,0 3,-1.354992 3,-3 V 8 7 A 1.0001,1.0001 0 0 0 20.707031,6.2929687 l -5,-5 A 1.0001,1.0001 0 0 0 15,1 h -1 z m 0,2 h 7 v 3 c 0,1.645008 1.354992,3 3,3 h 3 v 11 c 0,0.564129 -0.435871,1 -1,1 H 6 C 5.4358712,21 5,20.564129 5,20 V 4 C 5,3.4358712 5.4358712,3 6,3 Z M 15,3.4140625 18.585937,7 H 16 C 15.435871,7 15,6.5641288 15,6 Z" fill="currentColor" /></svg>',children:e.jsx(n.code,{children:e.jsxs(n.span,{className:"line",children:[e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:"<"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Callout"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">Your content here</"}),e.jsx(n.span,{style:{"--shiki-light":"#005CC5","--shiki-dark":"#79B8FF"},children:"Callout"}),e.jsx(n.span,{style:{"--shiki-light":"#24292E","--shiki-dark":"#E1E4E8"},children:">"})]})})})}),`
`]}),`
`,e.jsxs(n.li,{children:[`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Unique Heading IDs"})}),`
`,e.jsxs(n.p,{children:["Ensure all heading IDs are unique across the entire documentation. If you get a test failure about duplicate headings, customize the heading ID using ",e.jsx(n.code,{children:"[#custom-id]"})," syntax as described in the ",e.jsx(n.a,{href:"#unique-headings-requirement",children:"Unique Headings Requirement"})," section."]}),`
`]}),`
`]})]})}function m(t={}){const{wrapper:n}=t.components||{};return n?e.jsx(n,{...t,children:e.jsx(h,{...t})}):h(t)}function a(t,n){throw new Error("Expected component `"+t+"` to be defined: you likely forgot to import, pass, or provide it.")}export{d as _markdown,m as default,c as extractedReferences,l as frontmatter,u as structuredData,g as toc};
