import { roleIsAdmin, roleIsEditor, roleIsMediaManager, roleIsSuperAdmin } from '@/lib/lucia/rolechecker';
import { describe, expect, test } from 'vitest';

describe('Role Checker Functions', () => {
  test('roleIsSuperAdmin should return true for super_admin', () => {
    expect(roleIsSuperAdmin(['super_admin'])).toBe(true);
  });

  test('roleIsSuperAdmin should return false for non super_admin roles', () => {
    expect(roleIsSuperAdmin(['admin'])).toBe(false);
    expect(roleIsSuperAdmin(['editor'])).toBe(false);
  });

  test('roleIsAdmin should return true for admin roles', () => {
    expect(roleIsAdmin(['admin'])).toBe(true);
    expect(roleIsAdmin(['super_admin'])).toBe(true);
  });

  test('roleIsAdmin should return false for non admin roles', () => {
    expect(roleIsAdmin(['editor'])).toBe(false);
    expect(roleIsAdmin(['media_manager'])).toBe(false);
  });

  test('roleIsEditor should return true for editor', () => {
    expect(roleIsEditor(['editor'])).toBe(true);
  });

  test('roleIsEditor should return true for admin roles', () => {
    expect(roleIsEditor(['admin'])).toBe(true);
    expect(roleIsEditor(['super_admin'])).toBe(true);
  });

  test('roleIsEditor should return false for non editor and non admin roles', () => {
    expect(roleIsEditor(['media_manager'])).toBe(false);
    expect(roleIsEditor(['user'])).toBe(false);
  });

  test('roleIsMediaManager should return true for media_manager', () => {
    expect(roleIsMediaManager(['media_manager'])).toBe(true);
  });

  test('roleIsMediaManager should return true for admin roles', () => {
    expect(roleIsMediaManager(['admin'])).toBe(true);
    expect(roleIsMediaManager(['super_admin'])).toBe(true);
  });

  test('roleIsMediaManager should return false for non media_manager and non admin roles', () => {
    expect(roleIsMediaManager(['editor'])).toBe(false);
    expect(roleIsMediaManager(['user'])).toBe(false);
  });
});
