export function safeBackground(label: string, fn: () => Promise<unknown>): void {
  fn().catch((error) => {
    console.error(`[background] ${label} failed:`, {
      error: error instanceof Error ? error.message : String(error),
    });
  });
}
