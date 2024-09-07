import readline from "readline";
import { contractABI } from "../config/abi";
import { Contract, TransactionReceipt } from "ethers";

const { ethers } = require("hardhat");

async function main() {
  if (!process.env.QUICKSTART_CONTRACT_ADDRESS) {
    throw new Error("QUICKSTART_CONTRACT_ADDRESS env variable is not set.");
  }

  const contractAddress = process.env.QUICKSTART_CONTRACT_ADDRESS;
  const [signer] = await ethers.getSigners();

  // Create a contract instance
  const contract = new ethers.Contract(contractAddress, contractABI, signer);

  // The content of the image you want to generate
  const message = await getUserInput();

  // Call the startChat function
  try {
    const transactionResponse = await contract.startChat(message);
    // console.log(transactionResponse, "transactionResponse");

    const receipt = await transactionResponse.wait();
    // console.log(receipt, "receipt");

    console.log(
      `Transaction sent, hash: ${receipt.hash}.\nExplorer: https://explorer.galadriel.com/tx/${receipt.hash}`
    );
    console.log(`Chat started with message: "${message}"`);

    let chatId = getChatId(receipt, contract);
    console.log(`Created chat ID: ${chatId}`);
    if (!chatId && chatId !== 0) {
      return;
    }
  } catch (error) {
    console.error("Error starting chat:", error);
    return;
  }

  console.log("Waiting for response: ");
  let attempts = 0;
  const maxAttempts = 10; // Adjust as needed

  while (attempts < maxAttempts) {
    try {
      const chatRun = await contract.chatRuns(0); // Assuming 0 is the latest chat ID
      console.log(chatRun, "chatRun");

      console.log(
        `Chat run: Owner: ${
          chatRun[0]
        }, Messages Count: ${chatRun[1].toString()}`
      );

      if (Number(chatRun[1].toString()) >= 1) {
        const messages = await contract.getMessageHistory(0); // Use 0 as the chat ID
        console.log(messages, "messages");

        // Function to extract message content
        const getMessageContent = (message: any) => {
          if (message && message.content && message.content.length > 0) {
            return message.content[0].value;
          }
          return "Unable to retrieve message content";
        };

        // Extract and log system message
        const systemMessage = messages.find(
          (msg: any) => msg.role === "system"
        );
        console.log(
          "\nSystem message:",
          systemMessage
            ? getMessageContent(systemMessage)
            : "No system message found"
        );

        // Extract and log user message
        const userMessage = messages.find((msg: any) => msg.role === "user");
        console.log(
          "\nUser message:",
          userMessage ? getMessageContent(userMessage) : "No user message found"
        );

        // Extract and log assistant message (if present)
        const assistantMessage = messages.find(
          (msg: any) => msg.role === "assistant"
        );
        if (assistantMessage) {
          console.log("\nChat response:", getMessageContent(assistantMessage));
        } else {
          console.log("\nNo response from the assistant yet.");
        }

        break;
      }
    } catch (error) {
      console.error("Error while fetching chat run:", error);
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds
    process.stdout.write(".");
    attempts++;
  }

  if (attempts >= maxAttempts) {
    console.log(
      "\nNo response received after maximum attempts. Please check the contract state."
    );
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
    const input = await question("Enter an image description: ");
    rl.close();
    return input;
  } catch (err) {
    console.error("Error getting user input:", err);
    rl.close();
  }
}

function getChatId(receipt: TransactionReceipt, contract: Contract) {
  let chatId;
  for (const log of receipt.logs) {
    try {
      const parsedLog = contract.interface.parseLog(log);
      if (parsedLog && parsedLog.name === "ChatCreated") {
        // Second event argument
        chatId = ethers.toNumber(parsedLog.args[1]);
      }
    } catch (error) {
      // This log might not have been from your contract, or it might be an anonymous log
      console.log("Could not parse log:", log);
    }
  }
  return chatId;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
