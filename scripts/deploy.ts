import {artifacts, ethers} from "hardhat";
import fs from "fs";
import * as path from "path";
async function main() {
  const ContractFactory = await ethers.getContractFactory("Saing");

  // TODO: Set addresses for the contract arguments below
  const instance = await ContractFactory.deploy("Saing", "SAI", 1000000, 10000, 10);
  await instance.waitForDeployment();
  const getAddress = await instance.getAddress();
  saveFrontendFiles(getAddress);
  console.log(`Contract deployed to ${getAddress}`);
}
function saveFrontendFiles(token: string) {
  const contractsDir = path.join(__dirname, "..", "frontend", "src", "contracts");

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
      path.join(contractsDir, "contract-address.json"),
      JSON.stringify({ Token: token }, undefined, 2)
  );

  const TokenArtifact = artifacts.readArtifactSync("Saing");

  fs.writeFileSync(
      path.join(contractsDir, "Token.json"),
      JSON.stringify(TokenArtifact, null, 2)
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
