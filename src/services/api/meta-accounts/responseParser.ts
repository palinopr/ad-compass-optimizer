
export const parseApiResponse = async (response: Response) => {
  const responseText = await response.text();
  console.log('[AD ACCOUNT FETCH] Raw Body:', responseText);

  try {
    return JSON.parse(responseText);
  } catch (err) {
    console.error('[AD ACCOUNT FETCH] ❌ Failed to parse JSON:', err);
    throw err;
  }
};

