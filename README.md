# Universal Clipboard MCP

**Universal Clipboard MCP** is a powerful MCP server designed for seamless content transfer and format conversion. It allows developers and content creators to effortlessly convert content between various formats, including Markdown, HTML, and DOCX, directly within their development environment.

This tool is built to be highly extensible, allowing for the easy addition of new format converters and content processors to meet the evolving needs of any project.

## Features

- **Multi-format Conversion:** Convert content between a wide range of formats.
- **Format Detection:** Automatically detect the format of a given piece of content.
- **Batch Conversion:** Process multiple conversion requests in a single call.
- **Extensible:** Easily add new format converters and content processors.

## Supported Formats

The following formats are supported for conversion:

- Markdown
- HTML
- Plain Text
- JSON
- Slack Markdown
- GitHub Flavored Markdown
- JIRA Syntax
- Notion Blocks
- Linear Format
- DOCX
- AsciiDoc

## Installation

To get started, install the necessary dependencies:

```bash
npm install
```

## Usage

The core feature of this MCP server is the `convert_content` tool. Here’s a basic example of how to use it to convert Markdown to HTML:

```javascript
// Example of using the 'convert_content' tool
const convertedContent = await mcp.useTool('universal-clipboard-mcp', 'convert_content', {
  content: '# Hello, World!',
  sourceFormat: 'markdown',
  targetFormat: 'html'
});

console.log(convertedContent);
// Output: '<h1>Hello, World!</h1>'
```

### API

#### Tools

- **`convert_content`**: Transforms content from a source format to a target format.
  - `content` (string): The content to convert.
  - `sourceFormat` (string): The source format of the content.
  - `targetFormat` (string): The target format for the conversion.
- **`detect_format`**: Identifies the format of a given piece of content.
  - `content` (string): The content to analyze.
- **`list_supported_formats`**: Lists all supported content formats for conversion.
- **`preview_conversion`**: Shows a preview of how content will look after conversion without saving.
  - `content` (string): The content to convert.
  - `sourceFormat` (string): The source format of the content.
  - `targetFormat` (string): The target format for the conversion.
- **`convert_batch`**: Processes multiple conversion requests in a single call.
  - `requests` (array): An array of conversion request objects.

## Development

To build the project, run the following command:

```bash
npm run build
```

To run the test suite:

```bash
npm test
```

## Configuration

### VS Code

For manual installation, add the following JSON block to your User Settings (JSON) file in VS Code. You can do this by pressing `Ctrl + Shift + P` and typing `Preferences: Open Settings (JSON)`.

```json
{
  "mcp": {
    "servers": {
      "universal-clipboard-mcp": {
        "command": "npm",
        "args": [
          "start"
        ],
        "env": {
          "PATH": "${env:PATH}"
        }
      }
    }
  }
}
```

### Claude Desktop

Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "universal-clipboard-mcp": {
      "command": "npm",
      "args": [
        "start"
      ],
      "env": {
        "PATH": "${env:PATH}"
      }
    }
  }
}
```

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue if you have ideas for improvements or have found a bug.

## License

This project is licensed under the MIT License.
