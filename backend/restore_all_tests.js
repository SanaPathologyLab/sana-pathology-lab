/**
 * Master Test Restoration Script
 * Runs all original seed scripts in sequence to restore all tests with parameters.
 */
const { execSync } = require('child_process');
const path = require('path');

const scripts = [
  'seed.js',
  'seed_extra.js',
  'seedCustomTests.js',
  'seedTests.js',
  'updateCBCTest.js',
  'seedKFTTest.js',
  'seedLFTTest.js',
  'seedLipidProfile.js',
  'seedDengueProfile.js',
  'seedESRTest.js',
  'seedMoreTests.js',
  'seedSemenAndUrineTests.js',
  'seedRFTest.js',
  'seedCRPTest.js',
  'seedCRPQuantitativeTest.js',
  'seedCalciumTest.js',
  'seedBilirubinTest.js',
  'seedTyphidotTest.js',
  'seedMalariaSmear.js',
  'seedMantouxTest.js',
  'seedSGOTPT.js',
  'seedESRTest.js',
  'add_uric_acid.js',
  'splitFeverTests.js',
  'seedESRTest.js',
];

const dir = __dirname;

for (const script of scripts) {
  const fullPath = path.join(dir, script);
  try {
    console.log(`\n▶ Running ${script}...`);
    execSync(`node "${fullPath}"`, { stdio: 'inherit', cwd: dir });
    console.log(`✅ ${script} done.`);
  } catch (err) {
    console.error(`⚠️  ${script} failed (may be safe to ignore): ${err.message}`);
  }
}

console.log('\n✅ All test restoration scripts complete!');
