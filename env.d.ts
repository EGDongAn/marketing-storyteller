/// <reference types="node" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly SUPABASE_URL: string;
    readonly SUPABASE_ANON_KEY: string;
    readonly NOTION_API_KEY: string;
    readonly NOTION_DATABASE_ID: string;
    readonly SUPABASE_BUCKET_ID: string;
  }
}