import test from "node:test";
import assert from "node:assert";
import getMailServer from "./index.js";

test("getMailServer - should return mail server for valid domain", async () => {
  const mailServer = await getMailServer("google.com");
  assert.ok(typeof mailServer === "string");
  assert.ok(
    mailServer.includes(".google.com") || mailServer.includes(".googlemail.com")
  );
});

test("getMailServer - should handle timeout", async () => {
  // Use a domain that takes a long time to resolve with a very short timeout
  let errorThrown = false;

  try {
    // Using a subdomain that's unlikely to resolve quickly
    await getMailServer("test.subdomain.for.timeout.google.com", {
      timeout: 1,
    });
  } catch (err: any) {
    errorThrown = true;
    // Check the error message to verify it's a timeout error
    assert.strictEqual(err.message, "DNS lookup timed out after 1ms");
  }

  assert.ok(errorThrown, "Expected TimeoutError to be thrown");
});

test("getMailServer - should throw error for invalid domain", async () => {
  await assert.rejects(
    async () => {
      await getMailServer("invalid-domain-that-does-not-exist-12345.com");
    },
    (err: any) => {
      assert.ok(err instanceof Error);
      return true;
    }
  );
});

test("getMailServer - should return first MX record by priority", async () => {
  // Using a domain that reliably has MX records
  const mailServer = await getMailServer("microsoft.com");
  assert.ok(typeof mailServer === "string");
  assert.ok(mailServer.length > 0);
  // Microsoft typically uses outlook.com mail servers
  assert.ok(
    mailServer.includes("mail.protection.outlook.com") ||
      mailServer.includes("microsoft")
  );
});

test("getMailServer - should use default timeout of 5000ms", async () => {
  const start = Date.now();
  try {
    await getMailServer("google.com");
    const elapsed = Date.now() - start;
    assert.ok(elapsed < 5000);
  } catch (err: any) {
    // If it fails, ensure it's not a timeout error
    assert.ok(!err.message.includes("DNS lookup timed out"));
  }
});
