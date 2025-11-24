// Stub auth file to prevent build errors
export const auth = {
  api: {
    getSession: async (options?: any) => {
      return { user: null };
    }
  }
};