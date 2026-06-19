import { TESTS_DATA } from '../data/testsData';

const nameMap = Object.fromEntries(
  TESTS_DATA.map(t => [t.code, t.testName])
);

const testMap = Object.fromEntries(
  TESTS_DATA.map(t => [t.code, t])
);

export function getTestDisplayName(code) {
  return nameMap[code] || code;
}

export function getTestByCode(code) {
  return testMap[code] || null;
}

export const TEST_NAME_MAP = nameMap;
