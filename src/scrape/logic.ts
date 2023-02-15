export function abortablePromise<T>(
  signal: AbortSignal,
  promise: Promise<T>,
): Promise<T> {
  if (signal.aborted) return Promise.reject(new Error('Aborted'));

  return new Promise((resolve, reject) => {
    promise.then(resolve).catch(reject);

    const abortHandler = () => {
      signal.removeEventListener('abort', abortHandler);
      reject(new Error('Aborted'));
    };

    signal.addEventListener('abort', abortHandler);
  });
}

export function makeAbortable<T>(
  promise: Promise<T>,
): [Promise<T>, AbortController] {
  const abortController = new AbortController();
  const abortable = abortablePromise(abortController.signal, promise);
  return [abortable, abortController];
}
