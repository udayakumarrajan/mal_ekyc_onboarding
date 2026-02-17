// Mock uuid to avoid ESM issues in tests
jest.mock('uuid', () => ({
  v4: () => 'test-uuid-1234',
}));
