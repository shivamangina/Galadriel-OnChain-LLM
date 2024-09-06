import { ethers } from "hardhat";

const SYSTEM_PROMPT = "You are a helpful assistant";

async function main() {
  if (!process.env.ORACLE_ADDRESS) {
    throw new Error("ORACLE_ADDRESS env variable is not set.");
  }
  const oracleAddress: string = process.env.ORACLE_ADDRESS;
  for (let contractName of ["OpenAiChatGpt"]) {
    await deployChatGpt(contractName, oracleAddress, SYSTEM_PROMPT);
  }
}

async function deployChatGpt(
  contractName: string,
  oracleAddress: string,
  systemPrompt: string
) {
  const agent = await ethers.deployContract(
    contractName,
    [oracleAddress, systemPrompt],
    {}
  );

  await agent.waitForDeployment();

  console.log(`${contractName} deployed to ${agent.target}`);
}

// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
