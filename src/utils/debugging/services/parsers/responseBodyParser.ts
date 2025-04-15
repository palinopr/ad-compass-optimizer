
export const parseResponseBody = async (response: Response): Promise<{ text: string; error: any }> => {
  try {
    const text = await response.clone().text();
    let error = null;
    
    try {
      const data = JSON.parse(text);
      if (data.error) {
        error = data.error;
      }
    } catch (e) {
      console.error('Error parsing response JSON:', e);
    }
    
    return { text, error };
  } catch (e) {
    console.error('Error reading response:', e);
    return { text: 'Could not read response', error: null };
  }
};
