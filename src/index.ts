import { promises as dns } from "node:dns";

/**
 * Try getting domain name mail server within a specificied timeout,
 * throw an error otherwise.
 */

export default async (
  domain: string,
  options: { timeout?: number } = {}
): Promise<string> => {
  const { timeout = 5000 } = options;
  let timeoutId: NodeJS.Timeout | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error(`DNS lookup timed out after ${timeout}ms`)),
      timeout
    );
  });

  try {
    const result = await Promise.race([
      getFirstMxRecord(domain),
      timeoutPromise,
    ]);
    if (timeoutId) clearTimeout(timeoutId);
    return result;
  } catch (error) {
    if (timeoutId) clearTimeout(timeoutId);
    throw error;
  }
};

const getFirstMxRecord = async (domain: string): Promise<string> => {
  const records = await dns.resolveMx(domain);
  if (!records || records.length === 0) {
    throw new Error(`No MX records found for domain: ${domain}`);
  }
  const sortedRecords = records.sort((a, b) => a.priority - b.priority);
  return sortedRecords[0].exchange;
};
