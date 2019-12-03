import { Abi } from "@plugnet/api-contract";
import { WsProvider } from "@plugnet/rpc-provider";
import { Api } from "@cennznet/api";
import { u8aToHex } from "@cennznet/util";
import { Wallet, SimpleKeyring } from "@cennznet/wallet";
import { waitReady } from "@plugnet/wasm-crypto";

import BN from "bn.js";

import ABIJson from "./Spin2Win.json";

// If API has already been created, just use it.
let sdkApi = null;

const apiKey = "5b55b29e-bcb0-4ec7-9ae3-7c262ab0029c";

// network
const rimu = {
  url: `wss://rimu.unfrastructure.io/ws?apikey=${apiKey}`,
  contractAddress: "5EmcW7ndycEYkTjLoTpZKbChRKrqL7oQ1LNcuLXGUhZGg2zE",
  type: "Rimu"
};

// signer
const master = {
  address: "5C8JSNofegsFjwYHnrG7XtG1hCJ2PEtvQQFPkfeo75aLv6uB",
  seed: "0x6dfc73017eece8dbbf89736abdcefa5dcf9536a3c06da21031108f68f57382f7"
};

// Created the API using the web socket provider
// connected to the url of the network.
const createApi = async () => {
  if (sdkApi) return sdkApi;

  const { url } = rimu;
  const provider = new WsProvider(url);
  sdkApi = await Api.create({ provider });
  return sdkApi;
};

// Create the wallet from the SimpleKeyring which will
// hold the key pair for the master.
const createWallet = async () => {
  const simpleKeyring = new SimpleKeyring();
  simpleKeyring.addFromSeed(master.seed);

  const wallet = new Wallet();
  await wallet.createNewVault("666");
  await wallet.addKeyring(simpleKeyring);
  return wallet;
};

// Configure the API by setting the signer as master.
const configApi = async () => {
  await waitReady();
  const api = await createApi();
  const wallet = await createWallet();
  api.setSigner(wallet);
  return api;
};

// Generate the payload from the contract ABI.
const spin2win = accountId => {
  const contractAbi = new Abi(ABIJson);
  return contractAbi.messages.spin(accountId);
};

// Create the transaction, sign and send it. Return
// the transaction hash.
const sendReward = async address => {
  const { contractAddress } = rimu;
  const payload = spin2win(address);
  const endowment = new BN("10000");
  const api = await configApi();

  const tx = api.tx.contract.call(
    contractAddress,
    endowment, // deposit amount
    200000, // gas fee
    payload
  );

  const txHash = await tx.signAndSend(
    master.address,
    async ({ events, status }) => {
      if (status.isFinalized && events !== undefined) {
        const blockHash = status.asFinalized;
        console.log("@---blockHash---@:", u8aToHex(blockHash));
      }
    }
  );

  return txHash;
};

export default sendReward;
