
export const parseResponseBody = async (response: Response): Promise<string> => {
  try {
    return await response.clone().text();
  } catch (err) {
    console.error('[CAMPAIGN FETCH] ❌ Failed to parse response body:', err);
    return '';
  }
};
