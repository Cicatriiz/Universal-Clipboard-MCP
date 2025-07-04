# Universal Clipboard MCP

An MCP server for seamless content transfer and format conversion. This server allows you to convert content between various formats, including Markdown, HTML, DOCX, and more.

## Features

*   **Multi-format Conversion:** Convert content between a wide range of formats.
*   **Format Detection:** Automatically detect the format of a given piece of content.
*   **Batch Conversion:** Process multiple conversion requests in a single call.
*   **Extensible:** Easily add new format converters and content processors.

## API

### Tools

*   **`convert_content`**
    *   Transforms content from a source format to a target format.
    *   Inputs:
        *   `content` (string): The content to convert.
        *   `sourceFormat` (string): The source format of the content.
        *   `targetFormat` (string): The target format for the conversion.
*   **`detect_format`**
    *   Identifies the format of a given piece of content.
    *   Input: `content` (string)
*   **`list_supported_formats`**
    *   Lists all supported content formats for conversion.
*   **`preview_conversion`**
    *   Shows a preview of how content will look after conversion without saving.
    *   Inputs:
        *   `content` (string): The content to convert.
        *   `sourceFormat` (string): The source format of the content.
        *   `targetFormat` (string): The target format for the conversion.
*   **`convert_batch`**
    *   Processes multiple conversion requests in a single call.
    *   Input: `requests` (array of conversion requests)

## Usage with Claude Desktop

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

## Usage with VS Code

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

## Build

To build the project, run the following command:

```
npm run build
```

## License

This project is licensed under the MIT License.
