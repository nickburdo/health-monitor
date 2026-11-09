export type IgnoreInput = {
  ignored: boolean;
  // Non-empty when ignoring, '' when restoring.
  reason: string;
};
