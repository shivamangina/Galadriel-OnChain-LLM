import { ethers } from "hardhat";

async function main() {
  const oracleAddress = "0x68EC9556830AD097D661Df2557FBCeC166a0A075";

  for (let contractName of [
    "OpenAiJokeGenerater",
  ]) {
    await deployChatGpt(contractName, oracleAddress);
  }
}

async function deployChatGpt(contractName: string, oracleAddress: string) {
  const agent = await ethers.deployContract(contractName, [oracleAddress], {});

  await agent.waitForDeployment();

  console.log(`${contractName} deployed to ${agent.target}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
