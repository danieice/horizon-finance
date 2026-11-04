// resolves after a realistic delay so the UI shows skeletons and toasts
export function mockRequest<T>(data: T, delay = 300 + Math.random() * 500): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), delay));
}

export function mockFail(message: string, delay = 400): Promise<never> {
  return new Promise((_, reject) => setTimeout(() => reject(new Error(message)), delay));
}