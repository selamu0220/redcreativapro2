export const serverUsage = {
  async checkUsageCount(userId: string): Promise<{ usage: number; limit: number; allowed: boolean }> {
    return { usage: 0, limit: 100, allowed: true };
  },
  async incrementUsage(userId: string): Promise<number> {
    return 0;
  },
  async getUsage(userId: string): Promise<number> {
    return 0;
  }
};
