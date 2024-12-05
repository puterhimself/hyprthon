"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { ethers } from "ethers";

import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useGasless } from "@/lib/gasless";
import { useUploadThing } from "@/utils/uploadthing";
import { saleContractAddress, saleContractABI } from "@/utils/ContractConfig";

const formSchema = z.object({
	name: z.string().min(2).max(50).default("GG"),
	symbol: z.string().min(2).max(10).default("EZ"),
	description: z.string().min(10).max(1000).default("ghffghghfghfghfghfgfjghfjghfjhfgjg"),
	baseUri: z.string().url().default("https://api.example.com/metadata/"),
	price: z.string().min(1).default("0"),
	maxSupply: z.string().min(1).default("99"),
	imageUrl: z.string().url().optional(),
	bannerUrl: z.string().url().optional(),
	website: z.string().url().optional(),
	twitter: z.string().optional(),
	discord: z.string().optional(),
});

export default function CreateCollection() {
	const { address } = useAccount();
	const router = useRouter();
	const { toast } = useToast();
	const [isDeploying, setIsDeploying] = useState(false);
	const [previewImage, setPreviewImage] = useState<string | null>(null);
	const [previewBanner, setPreviewBanner] = useState<string | null>(null);
	const { startUpload } = useUploadThing("imageUploader");

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "GG",
			symbol: "EZ",
			description: "ghffghghfghfghfghfgfjghfjghfjhfgjg",
			baseUri: "https://api.example.com/metadata/",
			price: "0",
			maxSupply: "99",
			website: "",
			twitter: "",
			discord: "",
		},
	});

	const handleImageUpload = async (file: File, type: 'image' | 'banner') => {
		try {
			const res = await startUpload([file]);
			if (res?.[0]) {
				const imageUrl = res[0].url;
				if (type === 'image') {
					setPreviewImage(imageUrl);
					form.setValue("imageUrl", imageUrl);
				} else {
					setPreviewBanner(imageUrl);
					form.setValue("bannerUrl", imageUrl);
				}
				toast({
					title: "Success",
					description: `${type === 'image' ? 'Image' : 'Banner'} uploaded successfully`,
				});
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to upload image",
				variant: "destructive",
			});
		}
	};

	async function onSubmit(values: z.infer<typeof formSchema>) {
		if (!address) {
			toast({
				title: "Error",
				description: "Please connect your wallet first",
				variant: "destructive",
			});
			return;
		}
		const { sendTransaction } = await useGasless();

		try {
			setIsDeploying(true);

			// Create contract interface
			const contractInterface = new ethers.Interface(saleContractABI);

			// Prepare contract call data
			const callData = contractInterface.encodeFunctionData("deploy", [
				values.name,
				values.symbol,
				values.baseUri,
				ethers.parseEther(values.price),
				Number.parseInt(values.maxSupply),
			]);

			// Prepare transaction
			const transaction = {
				to: saleContractAddress,
				value: 0,
				data: callData,
			};

			// Send gasless transaction
			const txResponse = await sendTransaction(transaction);
			console.log(txResponse);
			
			// Wait for transaction confirmation
			const receipt = await txResponse.wait();
			console.log("ere------", receipt);

			// Get deployed contract address from events
			const deployEvent = receipt.logs
				.map(log => {
					try {
						return contractInterface.parseLog({
							topics: [...log.topics],
							data: log.data,
						});
					} catch {
						return null;
					}
				})
				.find(event => event?.name === "NFTDeployed");

			if (!deployEvent) {
				throw new Error("Could not find deployment event");
			}

			const deployedAddress = deployEvent.args.deployedAddress;

			// TODO: Save collection to database with deployedAddress
			// await createCollection({
			//   ...values,
			//   creatorId: address,
			//   contractAddress: deployedAddress,
			// });

			toast({
				title: "Success",
				description: "Collection created successfully",
			});

			router.push("/collections");
		} catch (error) {
			console.error(error);
			toast({
				title: "Error",
				description: "Failed to create collection",
				variant: "destructive",
			});
		} finally {
			setIsDeploying(false);
		}
	}

	return (
		<div className="min-h-screen bg-background">
			<div className="container max-w-[600px] p-4">
				<div className="space-y-2 mb-8">
					<h1 className="text-2xl font-bold tracking-tight">Create Collection</h1>
					<p className="text-muted-foreground">
						Deploy your NFT collection to the blockchain
					</p>
				</div>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						{/* Basic Info Section */}
						<div className="space-y-4">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Collection Name</FormLabel>
										<FormControl>
											<Input placeholder="My Awesome NFTs" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="symbol"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Symbol</FormLabel>
										<FormControl>
											<Input placeholder="NFTS" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Description</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Tell us about your collection..."
												className="min-h-[100px]"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<Separator className="my-4" />

						{/* Media Section */}
						<div className="space-y-4">
							<h2 className="text-lg font-semibold">Collection Media</h2>
							
							<div className="space-y-4">
								<div>
									<FormLabel>Collection Image</FormLabel>
									<div className="mt-2 flex flex-col items-center gap-4">
										{previewImage && (
											<div className="relative w-32 h-32 rounded-lg overflow-hidden">
												<Image
													src={previewImage}
													alt="Collection preview"
													fill
													className="object-cover"
												/>
											</div>
										)}
										<Input
											type="file"
											accept="image/*"
											onChange={(e) => {
												const file = e.target.files?.[0];
												if (file) handleImageUpload(file, 'image');
											}}
											className="w-full max-w-[300px]"
										/>
									</div>
								</div>

								<div>
									<FormLabel>Banner Image</FormLabel>
									<div className="mt-2 flex flex-col items-center gap-4">
										{previewBanner && (
											<div className="relative w-full h-32 rounded-lg overflow-hidden">
												<Image
													src={previewBanner}
													alt="Banner preview"
													fill
													className="object-cover"
												/>
											</div>
										)}
										<Input
											type="file"
											accept="image/*"
											onChange={(e) => {
												const file = e.target.files?.[0];
												if (file) handleImageUpload(file, 'banner');
											}}
											className="w-full max-w-[300px]"
										/>
									</div>
								</div>
							</div>
						</div>

						<Separator className="my-4" />

						{/* Collection Details Section */}
						<div className="space-y-4">
							<h2 className="text-lg font-semibold">Collection Details</h2>
							
							<FormField
								control={form.control}
								name="baseUri"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Metadata Base URI</FormLabel>
										<FormControl>
											<Input 
												placeholder="https://api.example.com/metadata/" 
												{...field} 
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="grid grid-cols-2 gap-4">
								<FormField
									control={form.control}
									name="price"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Price (ETH)</FormLabel>
											<FormControl>
												<Input 
													type="number" 
													step="0.01"
													placeholder="0.1" 
													{...field} 
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="maxSupply"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Supply</FormLabel>
											<FormControl>
												<Input 
													type="number" 
													placeholder="10000" 
													{...field} 
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>

						<Separator className="my-4" />

						{/* Social Links Section */}
						<div className="space-y-4">
							<h2 className="text-lg font-semibold">Social Links</h2>
							
							<FormField
								control={form.control}
								name="website"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Website</FormLabel>
										<FormControl>
											<Input placeholder="https://" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="twitter"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Twitter</FormLabel>
										<FormControl>
											<Input placeholder="@" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="discord"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Discord</FormLabel>
										<FormControl>
											<Input placeholder="https://discord.gg/" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<Button 
							type="submit" 
							disabled={isDeploying}
							className="w-full"
						>
							{isDeploying ? "Deploying..." : "Create Collection"}
						</Button>
					</form>
				</Form>
			</div>
		</div>
	);
}
