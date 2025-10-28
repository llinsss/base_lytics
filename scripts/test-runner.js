const { execSync } = require("child_process");

const TEST_SUITES = {
  basic: "test/BaseContracts.test.js",
  enhanced: "test/enhanced/*.test.js",
  integration: "test/integration/*.test.js", 
  security: "test/security/*.test.js",
  all: "test/**/*.test.js"
};

function runTests(suite = "all") {
  if (!TEST_SUITES[suite]) {
    console.log("❌ Invalid test suite");
    console.log("Available suites:", Object.keys(TEST_SUITES).join(", "));
    process.exit(1);
  }
  
  const testPath = TEST_SUITES[suite];
  console.log(`🧪 Running ${suite} tests...`);
  console.log("=" .repeat(50));
  
  try {
    execSync(`npx hardhat test ${testPath}`, { 
      stdio: "inherit",
      cwd: process.cwd()
    });
    console.log(`\n✅ ${suite} tests completed successfully!`);
  } catch (error) {
    console.log(`\n❌ ${suite} tests failed`);
    process.exit(1);
  }
}

const suite = process.argv[2] || "all";
runTests(suite);