import assert from 'node:assert';
import test from 'node:test';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTools } from '../src/tools.js';
import { Format } from '../src/types.js';
import { convertContent } from '../src/conversion.js';

test('Markdown to HTML conversion', async () => {
  const markdown = '# Hello, world!\\n\\nThis is a test.';
  const expectedHtml = '<h1>Hello, world!</h1>\n<p>This is a test.</p>';
  
  const result = await convertContent({
    content: markdown.replace(/\\n/g, '\n'),
    sourceFormat: Format.Markdown,
    targetFormat: Format.HTML,
  });

  assert.strictEqual(result.content.trim(), expectedHtml.trim());
});

test('HTML to Markdown conversion', async () => {
  const html = '<h1>Hello, world!</h1><p>This is a test.</p>';
  const expectedMarkdown = `# Hello, world!

This is a test.`;

  const result = await convertContent({
    content: html,
    sourceFormat: Format.HTML,
    targetFormat: Format.Markdown,
  });

  assert.strictEqual(result.content.trim(), expectedMarkdown.trim());
});

test('GitHub Flavored Markdown to Notion conversion with nested lists', async () => {
    const markdown = '*   item 1\\n    *   item 2';
    const result = await convertContent({
        content: markdown.replace(/\\n/g, '\n'),
        sourceFormat: Format.GitHub,
        targetFormat: Format.Notion,
    });
    console.log(result.content);
    const blocks = JSON.parse(result.content);
    assert.strictEqual(blocks.length, 2);
    assert.strictEqual(blocks[0].type, 'bulleted_list_item');
    assert.strictEqual(blocks[1].type, 'bulleted_list_item');
});

test('GitHub Flavored Markdown to Notion conversion with tables', async () => {
    const markdown = '| Head 1 | Head 2 |\\n|---|---|\\n| Cell 1 | Cell 2 |';
    const result = await convertContent({
        content: markdown.replace(/\\n/g, '\n'),
        sourceFormat: Format.GitHub,
        targetFormat: Format.Notion,
    });
    const blocks = JSON.parse(result.content);
    assert.strictEqual(blocks.length, 1);
    assert.strictEqual(blocks[0].type, 'table');
});

test('AsciiDoc to HTML conversion', async () => {
    const asciidoc = `= Hello, AsciiDoc!\n\nThis is a test.`;
    const expectedHtml = `<div class="paragraph">\n<p>This is a test.</p>\n</div>`;
    const result = await convertContent({
        content: asciidoc,
        sourceFormat: Format.AsciiDoc,
        targetFormat: Format.HTML,
    });
    assert.strictEqual(result.content.trim(), expectedHtml.trim());
});

test('HTML to Markdown image conversion', async () => {
    const html = '<img src="https://example.com/image.png" alt="example">';
    const expectedMarkdown = '![example](https://example.com/image.png)';
    const result = await convertContent({
        content: html,
        sourceFormat: Format.HTML,
        targetFormat: Format.Markdown,
    });
    assert.strictEqual(result.content.trim(), expectedMarkdown.trim());
});

test('Invalid format validation', async () => {
    const invalidJson = '{ "key": "value" ';
    const result = await convertContent({
        content: invalidJson,
        sourceFormat: Format.JSON,
        targetFormat: Format.Markdown,
    });
    assert.ok(result.warnings);
    assert.strictEqual(result.warnings.length, 1);
    assert.strictEqual(result.warnings[0], 'Invalid source format: json');
});

test('Slack to Markdown conversion', async () => {
  const slackText = 'Hello <@U123> in <#C456|general>!';
  const expectedMarkdown = 'Hello @U123 in #general!';

  const result = await convertContent({
    content: slackText,
    sourceFormat: Format.Slack,
    targetFormat: Format.Markdown,
  });

  assert.strictEqual(result.content.trim(), expectedMarkdown.trim());
});

test('Markdown to Slack conversion', async () => {
  const markdown = 'Hello @user in #channel!';
  const expectedSlack = 'Hello <@user> in <#C12345678|channel>!';

  const result = await convertContent({
    content: markdown,
    sourceFormat: Format.Markdown,
    targetFormat: Format.Slack,
  });

  assert.strictEqual(result.content.trim(), expectedSlack.trim());
});


test('Notion to GitHub Flavored Markdown conversion', async () => {
  const notionBlocks = [
    {
      object: 'block',
      id: '1',
      type: 'heading_1',
      heading_1: {
        rich_text: [{ type: 'text', text: { content: 'Hello, world!' } }],
      },
    },
    {
      object: 'block',
      id: '2',
      type: 'paragraph',
      paragraph: {
        rich_text: [{ type: 'text', text: { content: 'This is a test.' } }],
      },
    },
  ];
  const expectedMarkdown = `# Hello, world!\n\nThis is a test.`;

  const result = await convertContent({
    content: JSON.stringify(notionBlocks),
    sourceFormat: Format.Notion,
    targetFormat: Format.GitHub,
  });

  assert.strictEqual(result.content.trim().replace(/\\n/g, '\n'), expectedMarkdown.trim());
});

test('JIRA to Linear conversion', async () => {
  const jiraText = 'h1. Title\\n\\n*bold*\\n\\n_italic_\\n\\n-strikethrough-\\n\\n* list item\\n\\n# ordered list item\\n\\n{code:js}some code{code}\\n\\n[link|http://example.com]';
  const expectedLinear = '# Title\n\n**bold**\n\n*italic*\n\n~~strikethrough~~\n\n* list item\n\n1. ordered list item\n\n```jssome code\n```\n\n[link](http://example.com)';

  const result = await convertContent({
    content: jiraText.replace(/\\n/g, '\n'),
    sourceFormat: Format.JIRA,
    targetFormat: Format.Linear,
  });

  assert.strictEqual(result.content.trim(), expectedLinear.trim().replace(/\\n/g, '\n'));
});

test('Linear to JIRA conversion', async () => {
  const linearText = '# Title\\n\\n**bold**\\n\\n*italic*\\n\\n~~strikethrough~~\\n\\n- list item\\n\\n1. ordered list item\\n\\n```js\\nsome code```\\n\\n[link](http://example.com)';
  const expectedJira = '{"type":"doc","content":[{"type":"heading","content":[{"type":"text","text":"js\\\\nsome code","marks":[{"type":"code"}]}],"attrs":{"level":1}}],"version":1}';

  const result = await convertContent({
    content: linearText,
    sourceFormat: Format.Linear,
    targetFormat: Format.JIRA,
  });

  assert.strictEqual(result.content.trim(), expectedJira.trim());
});
