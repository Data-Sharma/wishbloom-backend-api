beforeEach(() => {
  (global as any).fetch = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
});

