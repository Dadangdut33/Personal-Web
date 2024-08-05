import * as schema from '@/lib/db/schema';
import { dbConfig } from '@/lib/db/utils';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { describe, expect, test, vi } from 'vitest';

describe('DB Connection Test', () => {
  test('should connect to the database and check version', async () => {
    // Mock console.log and console.error
    const consoleLogSpy = vi.spyOn(console, 'log');
    const consoleErrorSpy = vi.spyOn(console, 'error');

    // ------------------------
    // Mock the query if needed
    // const queryMock = vi.fn().mockResolvedValue({ rows: [{ version: "PostgreSQL 13.3" }] });
    // vi.spyOn(Pool.prototype, "query").mockImplementation(queryMock);
    // expect(consoleLogSpy).toHaveBeenNthCalledWith(5, "PostgreSQL 13.3");
    // ------------------------

    // Execute the script
    const run = async () => {
      console.log('🚀 Connecting to database...');
      console.log('config:');
      console.log(dbConfig);
      const client = new Pool({ ...dbConfig, max: 1 });
      const db = drizzle(client, { schema });

      console.log('⏳ Testing...');

      const start = Date.now();

      const result = await client.query('SELECT VERSION()');
      console.log('results:');
      console.log(result.rows[0].version);

      const end = Date.now();

      console.log('✅ Test completed in', end - start, 'ms');
    };

    await run().catch((err) => {
      console.error('❌ Test failed');
      console.error(err);
    });

    // Assertions
    expect(consoleLogSpy).toHaveBeenNthCalledWith(1, '🚀 Connecting to database...');
    expect(consoleLogSpy).toHaveBeenNthCalledWith(2, 'config:');
    expect(consoleLogSpy).toHaveBeenNthCalledWith(3, dbConfig);
    expect(consoleLogSpy).toHaveBeenNthCalledWith(4, '⏳ Testing...');
    expect(consoleLogSpy).toHaveBeenNthCalledWith(5, 'results:'); // version string
    expect(consoleLogSpy).toHaveBeenNthCalledWith(6, expect.stringMatching(/PostgreSQL 1\d+/)); // version string
    expect(consoleLogSpy).toHaveBeenNthCalledWith(7, '✅ Test completed in', expect.any(Number), 'ms');

    // Restore mocks and stubs
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  test('should handle errors', async () => {
    // Mock console.log and console.error
    const consoleLogSpy = vi.spyOn(console, 'log');
    const consoleErrorSpy = vi.spyOn(console, 'error');

    // Mock Pool and client.query to throw an error
    const queryMock = vi.fn().mockRejectedValue(new Error('Connection failed'));
    vi.spyOn(Pool.prototype, 'query').mockImplementation(queryMock);

    // Execute the script
    const run = async () => {
      console.log('🚀 Connecting to database...');
      console.log('config:');
      console.log(dbConfig);
      const client = new Pool({ ...dbConfig, max: 1 });
      const db = drizzle(client, { schema });

      console.log('⏳ Testing...');

      const start = Date.now();

      await client.query('SELECT VERSION()');

      const end = Date.now();

      console.log('✅ Test completed in', end - start, 'ms');
    };

    await run().catch((err) => {
      console.error('❌ Test failed (expected)');
      console.error(err);
    });

    // Assertions
    expect(consoleErrorSpy).toHaveBeenNthCalledWith(1, '❌ Test failed (expected)');
    expect(consoleErrorSpy).toHaveBeenNthCalledWith(2, expect.any(Error));

    // Restore mocks and stubs
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });
});
