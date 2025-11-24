// Stub supabase file to prevent build errors
export const supabaseAdmin = {
  from: (table: string) => ({
    select: (columns?: string) => ({
      eq: (column: string, value: any) => ({
        single: () => Promise.resolve({ data: null, error: new Error('Not implemented') })
      })
    }),
    insert: (data: any) => Promise.resolve({ data: null, error: new Error('Not implemented') }),
    order: (column: string) => Promise.resolve({ data: [], error: null })
  })
};