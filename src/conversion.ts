import { ConversionRequest, ConversionResult, Format, NotionBlock } from "./types";
import { detectFormat } from "./formats";
import { validateFormat } from "./validation";
import { marked } from 'marked';
import TurndownService from 'turndown';
import mammoth from 'mammoth';
import Asciidoctor from '@asciidoctor/core';
import { githubToNotion, notionToGitHub, jiraToLinear, linearToJira } from './processors';

const asciidoctor = Asciidoctor();

const turndownService = new TurndownService({ headingStyle: 'atx' });
turndownService.addRule('images', {
    filter: 'img',
    replacement: function (content, node) {
        const element = node as Element;
        const alt = element.getAttribute('alt') || '';
        const src = element.getAttribute('src') || '';
        return src ? `![${alt}](${src})` : '';
    }
});

// --- Slack Converters ---
function slackToMarkdown(text: string): string {
  return text
    .replace(/<@(U[A-Z0-9]+)>/g, '@$1') // User mentions
    .replace(/<#(C[A-Z0-9]+)\|(.+?)>/g, '#$2') // Channel mentions
    .replace(/<http(.+?)>/g, 'http$1'); // Links
}

function markdownToSlack(text: string): string {
  return text
    .replace(/@(\w+)/g, '<@$1>') // User mentions
    .replace(/#([\w-]+)/g, '<#C12345678|$1>'); // Channel mentions (requires a lookup)
}

export async function convertContent(request: ConversionRequest): Promise<ConversionResult> {
  const { content, sourceFormat, targetFormat, metadata, options } = request;
  const detectedSource = sourceFormat || detectFormat(content);

  if (!validateFormat(content, detectedSource)) {
    return {
      content: '',
      format: targetFormat,
      warnings: [`Invalid source format: ${detectedSource}`],
    };
  }

  let convertedContent = content;
  const warnings: string[] = [];

  // --- Conversion Logic ---
  const conversionPath = `${detectedSource}_to_${targetFormat}`;

  switch (conversionPath) {
    case 'asciidoc_to_html':
        convertedContent = asciidoctor.convert(content, { standalone: false }).toString();
        break;
    case 'docx_to_html':
        const result = await mammoth.convertToHtml({ buffer: Buffer.from(content, 'base64') });
        convertedContent = result.value;
        break;
    case 'markdown_to_html':
      convertedContent = await marked.parse(content);
      break;
    case 'html_to_markdown':
      convertedContent = turndownService.turndown(content);
      break;
    case 'slack_markdown_to_markdown':
      convertedContent = slackToMarkdown(content);
      break;
    case 'markdown_to_slack_markdown':
      convertedContent = markdownToSlack(content);
      warnings.push("Markdown to Slack conversion is basic. Channel IDs are placeholders.");
      break;
    case 'github_flavored_markdown_to_notion_blocks':
      const notionBlocks = githubToNotion(content);
      convertedContent = JSON.stringify(notionBlocks, null, 2);
      break;
    case 'notion_blocks_to_github_flavored_markdown':
      try {
        const blocks = JSON.parse(content) as NotionBlock[];
        convertedContent = notionToGitHub(blocks);
      } catch (error) {
        warnings.push("Invalid Notion block JSON.");
      }
      break;
    case 'jira_syntax_to_github_flavored_markdown':
    case 'jira_syntax_to_linear_format':
      convertedContent = jiraToLinear(content);
      break;
    case 'github_flavored_markdown_to_jira_syntax':
    case 'linear_format_to_jira_syntax':
      convertedContent = linearToJira(content);
      break;
    default:
      warnings.push(`Conversion from ${detectedSource} to ${targetFormat} is not supported yet.`);
  }

  if (options && options.template) {
    convertedContent = options.template.replace('{{content}}', convertedContent);
  }

  return {
    content: convertedContent,
    format: targetFormat,
    warnings,
    metadata,
  };
}
