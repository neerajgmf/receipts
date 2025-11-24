// Stub auth file to prevent build errors
export const auth = {
  api: {
    getSession: async () => {
      return { user: null };
    }
  }
};