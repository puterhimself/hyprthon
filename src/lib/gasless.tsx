import {
	createSmartAccountClient,
	type Transaction,
	PaymasterMode,
} from "@0xgasless/smart-account";
import config from "./config.json";
import { ethers } from "ethers";

export async function useGasless() {
	const signer = new ethers.Wallet(
		config.privateKey,
		new ethers.JsonRpcProvider(config.rpcUrl),
	);

	const SmartAccountClient = await createSmartAccountClient({
		signer,
		chainId: config.chainId,
		bundlerUrl: config.bundlerUrl,
		paymasterUrl: config.PaymasterUrl,
	});

	const EOAddress = await signer.getAddress();
	const SmartAccountAddress = await SmartAccountClient.getAddress();

	const sendTransaction = async (tx: Transaction) => {
		const txResponse = await SmartAccountClient.sendTransaction(tx, {
			paymasterServiceData: {
				mode: PaymasterMode.SPONSORED,
			},
		});
		return txResponse;
	};

	return {
		EOAddress,
		SmartAccountAddress,
		sendTransaction,
	};
}
