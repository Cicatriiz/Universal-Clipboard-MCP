declare module 'j2m' {
  export function toGfm(jiraText: string): string;
  export function toJira(gfmText: string): string;
}
