export const useApiFetch = () => {
  const { getIdToken } = useFirebaseAuth();

  const apiFetch = async <T>(
    url: string,
    options: Parameters<typeof $fetch>[1] = {},
  ) => {
    const token = await getIdToken();

    return await $fetch<T>(url, {
      ...options,
      headers: {
        ...options.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  };

  return {
    apiFetch,
  };
};
