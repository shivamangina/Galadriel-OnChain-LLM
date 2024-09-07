import { contractABI } from "../config/abi";

const { ethers } = require("hardhat");

async function main() {
  if (!process.env.QUICKSTART_CONTRACT_ADDRESS) {
    throw new Error("QUICKSTART_CONTRACT_ADDRESS env variable is not set.");
  }

  const contractAddress = process.env.QUICKSTART_CONTRACT_ADDRESS;
  const [signer] = await ethers.getSigners();

  // Create a contract instance
  const contract = new ethers.Contract(contractAddress, contractABI, signer);

  const chatRun = await contract.chatRuns(32); // Assuming 0 is the latest chat ID
  console.log(chatRun, "chatRun");

  console.log(
    `Chat run: Owner: ${chatRun[0]}, Messages Count: ${chatRun[1].toString()}`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
