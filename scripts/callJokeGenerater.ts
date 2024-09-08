import readline from "readline";
import { contractABI } from "../config/abi";

const { ethers } = require("hardhat");

async function main() {
  const contractAddress = "0x13C081cfec90B538dc8334D405Df2F24a41b76B2";
  const [signer] = await ethers.getSigners();

  // Create a contract instance
  const contract = new ethers.Contract(contractAddress, contractABI, signer);

  // The content of the image you want to generate
  const message = await getUserInput();

  // Call the sendMessage function
  const transactionResponse = await contract.sendMessage(
    "Tell Me a joke on " + message
  );
  const receipt = await transactionResponse.wait();
  console.log(`Message sent, tx hash: ${receipt.hash}`);
  console.log(`Chat started with message: "${message}"`);

  // Read the LLM response on-chain
  while (true) {
    const response = await contract.response();
    if (response) {
      console.log("Response from contract:", response);
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}

async function getUserInput(): Promise<string | undefined> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (query: string): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(query, (answer) => {
        resolve(answer);
      });
    });
  };

  try {
    const input = await question("Enter the keywords: ");
    rl.close();
    return input;
  } catch (err) {
    console.error("Error getting user input:", err);
    rl.close();
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
