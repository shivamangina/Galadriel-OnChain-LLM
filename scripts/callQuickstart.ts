// Import ethers from Hardhat package
import readline from "readline";

const { ethers } = require("hardhat");

async function main() {
  const contractABI = [
    {
      inputs: [
        {
          internalType: "address",
          name: "initialOracleAddress",
          type: "address",
        },
        {
          internalType: "string",
          name: "systemPrompt",
          type: "string",
        },
      ],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "owner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "chatId",
          type: "uint256",
        },
      ],
      name: "ChatCreated",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "newOracleAddress",
          type: "address",
        },
      ],
      name: "OracleAddressUpdated",
      type: "event",
    },
    {
      inputs: [
        {
          internalType: "string",
          name: "message",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "runId",
          type: "uint256",
        },
      ],
      name: "addMessage",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "chatRuns",
      outputs: [
        {
          internalType: "address",
          name: "owner",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "messagesCount",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "chatId",
          type: "uint256",
        },
      ],
      name: "getMessageHistory",
      outputs: [
        {
          components: [
            {
              internalType: "string",
              name: "role",
              type: "string",
            },
            {
              components: [
                {
                  internalType: "string",
                  name: "contentType",
                  type: "string",
                },
                {
                  internalType: "string",
                  name: "value",
                  type: "string",
                },
              ],
              internalType: "struct IOracle.Content[]",
              name: "content",
              type: "tuple[]",
            },
          ],
          internalType: "struct IOracle.Message[]",
          name: "",
          type: "tuple[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "runId",
          type: "uint256",
        },
        {
          internalType: "string",
          name: "response",
          type: "string",
        },
        {
          internalType: "string",
          name: "errorMessage",
          type: "string",
        },
      ],
      name: "onOracleFunctionResponse",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "runId",
          type: "uint256",
        },
        {
          components: [
            {
              internalType: "string",
              name: "id",
              type: "string",
            },
            {
              internalType: "string",
              name: "content",
              type: "string",
            },
            {
              internalType: "string",
              name: "functionName",
              type: "string",
            },
            {
              internalType: "string",
              name: "functionArguments",
              type: "string",
            },
            {
              internalType: "uint64",
              name: "created",
              type: "uint64",
            },
            {
              internalType: "string",
              name: "model",
              type: "string",
            },
            {
              internalType: "string",
              name: "systemFingerprint",
              type: "string",
            },
            {
              internalType: "string",
              name: "object",
              type: "string",
            },
            {
              internalType: "uint32",
              name: "completionTokens",
              type: "uint32",
            },
            {
              internalType: "uint32",
              name: "promptTokens",
              type: "uint32",
            },
            {
              internalType: "uint32",
              name: "totalTokens",
              type: "uint32",
            },
          ],
          internalType: "struct IOracle.OpenAiResponse",
          name: "response",
          type: "tuple",
        },
        {
          internalType: "string",
          name: "errorMessage",
          type: "string",
        },
      ],
      name: "onOracleOpenAiLlmResponse",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "oracleAddress",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "prompt",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "newOracleAddress",
          type: "address",
        },
      ],
      name: "setOracleAddress",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "string",
          name: "message",
          type: "string",
        },
      ],
      name: "startChat",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
  ];

  if (!process.env.QUICKSTART_CONTRACT_ADDRESS) {
    throw new Error("QUICKSTART_CONTRACT_ADDRESS env variable is not set.");
  }

  // chatRuns

  const contractAddress = process.env.QUICKSTART_CONTRACT_ADDRESS;
  const [signer] = await ethers.getSigners();

  // Create a contract instance
  const contract = new ethers.Contract(contractAddress, contractABI, signer);

  // The content of the image you want to generate
  const message = await getUserInput();

  // Call the startChat function
  const transactionResponse = await contract.startChat(message);
  const receipt = await transactionResponse.wait();
  console.log(
    `Transaction sent, hash: ${receipt.hash}.\nExplorer: https://explorer.galadriel.com/tx/${receipt.hash}`
  );
  console.log(`Chat started with message: "${message}"`);

  // loop and sleep by 1000ms, and keep printing `lastResponse` in the contract.
  let lastResponse = await contract.lastResponse();
  let newResponse = lastResponse;

  // print w/o newline
  console.log("Waiting for response: ");
  while (newResponse === lastResponse) {
    // TODO: Get the chat history
    await new Promise((resolve) => setTimeout(resolve, 1000));
    newResponse = await contract.chatRuns();
    console.log(".");
  }

  console.log(`Image generation completed, image URL: ${newResponse}`);
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

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
