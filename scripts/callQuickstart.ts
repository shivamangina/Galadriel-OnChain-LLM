import readline from "readline";
import { contractABI } from "../config/abi";
import { Contract, TransactionReceipt } from "ethers";

const { ethers } = require("hardhat");

interface Message {
  role: string;
  content: string;
}

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
  let allMessages: Message[] = [];
  let waitingForResponse = true;
  let attempts = 0;
  const maxAttempts = 10; // Maximum number of attempts (adjust as needed)

  while (waitingForResponse && attempts < maxAttempts) {
    const messages: Message[] = await getNewMessages(contract, chatId);
    console.log(messages, "messages");

    const newMessages = messages.slice(allMessages.length);
    console.log(newMessages, "newMessages");

    if (newMessages.length > 0) {
      for (let message of newMessages) {
        console.log(`${message.role}: ${message.content}`);
        allMessages.push(message);

        if (message.role === "assistant") {
          waitingForResponse = false;
          break;
        }
      }
    }

    if (waitingForResponse) {
      console.log("Waiting for assistant's response...");
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds before next attempt
      attempts++;
    }
  }

  if (attempts >= maxAttempts) {
    console.log("Max attempts reached. No response from assistant.");
    return;
  }

  console.log(
    "Assistant has responded. You can now continue the conversation."
  );

  // Continue the chat loop for further interactions
  while (true) {
    const userMessage: any = await getUserInput();
    console.log("User Input:", userMessage);

    const transactionResponse = await contract.addMessage(userMessage, chatId);
    const receipt = await transactionResponse.wait();
    console.log(`Message sent, tx hash: ${receipt.hash}`);

    allMessages.push({ role: "user", content: userMessage });

    waitingForResponse = true;
    attempts = 0;

    while (waitingForResponse && attempts < maxAttempts) {
      const messages: Message[] = await getNewMessages(contract, chatId);

      const newMessages = messages.slice(allMessages.length);

      if (newMessages.length > 0) {
        for (let message of newMessages) {
          console.log(`${message.role}: ${message.content}`);
          allMessages.push(message);

          if (message.role === "assistant") {
            waitingForResponse = false;
            break;
          }
        }
      }

      if (waitingForResponse) {
        console.log("Waiting for assistant's response...");
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds before next attempt
        attempts++;
      }
    }

    if (attempts >= maxAttempts) {
      console.log("Max attempts reached. No response from assistant.");
      break;
    }
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

async function getNewMessages(
  contract: Contract,
  chatId: number
): Promise<Message[]> {
  // Add a 5-second delay before fetching messages
  await new Promise((resolve) => setTimeout(resolve, 5000));

  const messages = await contract.getMessageHistory(chatId);

  return messages.map((message: any) => ({
    role: message.role,
    content: message.content[0].value,
  }));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
