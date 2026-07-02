/** Minimal Deno globals for Supabase Edge Functions (IDE + Deno runtime). */
declare const Deno: {
  serve(handler: (req: Request) => Response | Promise<Response>): void;
  env: {
    get(key: string): string | undefined;
  };
};
