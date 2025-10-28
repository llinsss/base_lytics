const { execSync } = require("child_process");
const fs = require("fs");

async function generateCoverage() {
  console.log("📊 Generating test coverage report...");
  console.log("=" .repeat(50));
  
  try {
    // Run coverage
    execSync("npx hardhat coverage", { 
      stdio: "inherit",
      cwd: process.cwd()
    });
    
    // Check if coverage file exists
    if (fs.existsSync("coverage/lcov-report/index.html")) {
      console.log("\n✅ Coverage report generated!");
      console.log("📁 Open coverage/lcov-report/index.html in browser");
    }
    
  } catch (error) {
    console.log("\n❌ Coverage generation failed");
    console.log("💡 Install solidity-coverage: npm install --save-dev solidity-coverage");
    process.exit(1);
  }
}

generateCoverage();