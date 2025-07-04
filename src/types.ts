export enum Format {
  Markdown = "markdown",
  HTML = "html",
  PlainText = "plaintext",
  JSON = "json",
  Slack = "slack_markdown",
  GitHub = "github_flavored_markdown",
  JIRA = "jira_syntax",
  Notion = "notion_blocks",
  Linear = "linear_format",
  DOCX = "docx",
  AsciiDoc = "asciidoc"
}

export interface ConversionRequest {
  content: string;
  sourceFormat?: Format;
  targetFormat: Format;
  options?: {
    preserveFormatting?: boolean;
    handleMentions?: boolean;
    convertLinks?: boolean;
    template?: string;
  };
  metadata?: Record<string, any>;
}

export interface ConversionResult {
  content: string;
  format: Format;
  warnings?: string[];
  metadata?: Record<string, any>;
}

// --- Notion Block Types ---
export interface NotionBlock {
  object: 'block';
  id: string;
  type: string;
  table?: {
    table_width: number;
    has_column_header: boolean;
    has_row_header: boolean;
    children: NotionBlock[];
  };
  table_row?: {
    cells: {
        rich_text: {
            type: 'text';
            text: {
                content: string;
            };
        }[];
    }[];
  };
  [key: string]: any;
}
