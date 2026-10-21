export type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  danger?: boolean;
};

type ConfirmState = {
  open: boolean;
  options: ConfirmOptions | null;
  resolve: ((confirmed: boolean) => void) | null;
};

// Single shared dialog: ConfirmDialog in HealthShell renders this state.
export function useConfirm() {
  const state = useState<ConfirmState>('confirm-dialog', () => ({
    open: false,
    options: null,
    resolve: null,
  }));

  function settle(confirmed: boolean) {
    const resolve = state.value.resolve;

    state.value = { open: false, options: null, resolve: null };
    resolve?.(confirmed);
  }

  function confirm(options: ConfirmOptions) {
    // A newer request replaces an open dialog; the previous caller gets a cancel.
    if (state.value.open) {
      settle(false);
    }

    return new Promise<boolean>((resolve) => {
      state.value = {
        open: true,
        options: { cancelLabel: 'Cancel', ...options },
        resolve,
      };
    });
  }

  function accept() {
    settle(true);
  }

  function cancel() {
    settle(false);
  }

  return {
    state,
    confirm,
    accept,
    cancel,
  };
}
