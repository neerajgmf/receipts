// Stub supabase file to prevent build errors
export const supabaseAdmin = {
  from: () => ({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: null, error: new Error('Not implemented') })
      })
    }),
    insert: () => Promise.resolve({ data: null, error: new Error('Not implemented') }),
    order: () => Promise.resolve({ data: [], error: null })
  })
};