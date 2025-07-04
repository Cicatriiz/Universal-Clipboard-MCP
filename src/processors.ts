import { NotionBlock } from './types';
import { micromark } from 'micromark';
import { gfm, gfmHtml } from 'micromark-extension-gfm';
import { JSDOM } from 'jsdom';

// --- GitHub Flavored Markdown <-> Notion Blocks ---

function htmlToNotionBlocks(html: string): NotionBlock[] {
    const dom = new JSDOM(html);
    const body = dom.window.document.body;
    const blocks: NotionBlock[] = [];

    for (const node of body.childNodes) {
        const block = nodeToNotionBlock(node);
        if (block) {
            blocks.push(...(Array.isArray(block) ? block : [block]));
        }
    }

    return blocks;
}

function nodeToNotionBlock(node: ChildNode): NotionBlock | NotionBlock[] | null {
    switch (node.nodeName) {
        case 'H1':
        case 'H2':
        case 'H3':
            const level = parseInt(node.nodeName.substring(1));
            return {
                object: 'block',
                id: `block-${Date.now()}-${Math.random()}`,
                type: `heading_${level}`,
                [`heading_${level}`]: {
                    rich_text: [{ type: 'text', text: { content: node.textContent || '' } }],
                },
            } as NotionBlock;
        case 'P':
            return {
                object: 'block',
                id: `block-${Date.now()}-${Math.random()}`,
                type: 'paragraph',
                paragraph: {
                    rich_text: [{ type: 'text', text: { content: node.textContent || '' } }],
                },
            };
        case 'UL':
        case 'OL':
            const listItems: NotionBlock[] = [];
            for (const item of Array.from(node.childNodes)) {
                if (item.nodeName === 'LI') {
                    const element = item as Element;
                    const listItem = {
                        object: 'block',
                        id: `block-${Date.now()}-${Math.random()}`,
                        type: node.nodeName === 'OL' ? 'numbered_list_item' : 'bulleted_list_item',
                        [node.nodeName === 'OL' ? 'numbered_list_item' : 'bulleted_list_item']: {
                            rich_text: [{ type: 'text', text: { content: element.childNodes[0].textContent || '' } }],
                        },
                    } as NotionBlock;
                    listItems.push(listItem);
                    const nestedList = element.querySelector('ul, ol');
                    if (nestedList) {
                        const nestedBlocks = nodeToNotionBlock(nestedList);
                        if (nestedBlocks) {
                            listItems.push(...(Array.isArray(nestedBlocks) ? nestedBlocks : [nestedBlocks]));
                        }
                    }
                }
            }
            return listItems;
        case 'TABLE':
            const tableRows: NotionBlock[] = [];
            const table = node as HTMLTableElement;
            const header = table.querySelector('thead');
            if (header) {
                const headerRow: NotionBlock = {
                    object: 'block',
                    id: `block-${Date.now()}-${Math.random()}`,
                    type: 'table_row',
                    table_row: {
                        cells: Array.from(header.querySelectorAll('th')).map(h => ({ rich_text: [{ type: 'text', text: { content: h.textContent || '' } }] }))
                    }
                };
                tableRows.push(headerRow);
            }
            const body = table.querySelector('tbody');
            if (body) {
                for (const row of body.querySelectorAll('tr')) {
                    const tableRow: NotionBlock = {
                        object: 'block',
                        id: `block-${Date.now()}-${Math.random()}`,
                        type: 'table_row',
                        table_row: {
                            cells: Array.from(row.querySelectorAll('td')).map(cell => ({ rich_text: [{ type: 'text', text: { content: cell.textContent || '' } }] }))
                        }
                    };
                    tableRows.push(tableRow);
                }
            }
            return {
                object: 'block',
                id: `block-${Date.now()}-${Math.random()}`,
                type: 'table',
                table: {
                    table_width: header ? header.querySelectorAll('th').length : 0,
                    has_column_header: !!header,
                    has_row_header: false,
                    children: tableRows,
                },
            };
        default:
            return null;
    }
}


export function githubToNotion(markdown: string): NotionBlock[] {
  const html = micromark(markdown, {
    extensions: [gfm()],
    htmlExtensions: [gfmHtml()],
  });
  return htmlToNotionBlocks(html);
}

export function notionToGitHub(blocks: NotionBlock[]): string {
  return blocks
    .map(block => {
      switch (block.type) {
        case 'heading_1':
          return `# ${block.heading_1.rich_text.map((t: any) => t.text.content).join('')}`;
        case 'heading_2':
            return `## ${block.heading_2.rich_text.map((t: any) => t.text.content).join('')}`;
        case 'heading_3':
            return `### ${block.heading_3.rich_text.map((t: any) => t.text.content).join('')}`;
        case 'bulleted_list_item':
            return `* ${block.bulleted_list_item.rich_text.map((t: any) => t.text.content).join('')}`;
        case 'numbered_list_item':
            return `1. ${block.numbered_list_item.rich_text.map((t: any) => t.text.content).join('')}`;
        case 'code':
            return '```' + `${block.code.language}\\n${block.code.rich_text.map((t: any) => t.text.content).join('')}` + '```';
        case 'paragraph':
          return block.paragraph.rich_text.map((t: any) => t.text.content).join('');
        case 'table':
            if (block.table && block.table.children.length > 0) {
                const headerRow = block.table.children[0];
                if (!headerRow.table_row) return '';
                const header = headerRow.table_row.cells.map((c: any) => c.rich_text[0].text.content).join(' | ');
                const divider = headerRow.table_row.cells.map(() => '---').join(' | ');
                const body = block.table.children.slice(1).map((row: any) => {
                    if(!row.table_row) return '';
                    return row.table_row.cells.map((c: any) => c.rich_text[0].text.content).join(' | ')
                }).join('\\n');
                return `${header}\\n${divider}\\n${body}`;
            }
            return '';
        default:
          return '';
      }
    })
    .join('\\n\\n');
}

// --- JIRA <-> Linear/GitHub ---

export function jiraToLinear(jiraText: string): string {
  // Placeholder for JIRA to Linear/GitHub conversion
  console.log('Converting JIRA to Linear/GitHub...');
  return jiraText
    .replace(/h1\./g, '#')
    .replace(/h2\./g, '##')
    .replace(/h3\./g, '###')
    .replace(/\{code\}/g, '```')
    .replace(/\[(.*?)\|(.*?)\]/g, '[$1]($2)'); // Links
}

export function linearToJira(linearText: string): string {
  // Placeholder for Linear/GitHub to JIRA conversion
  console.log('Converting Linear/GitHub to JIRA...');
  return linearText
    .replace(/^# /g, 'h1. ')
    .replace(/^## /g, 'h2. ')
    .replace(/^### /g, 'h3. ')
    .replace(/```/g, '{code}')
    .replace(/\\[(.*?)\\]\\((.*?)\\)/g, '[$1|$2]'); // Links
}
