// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ERC721a-standard.sol";

contract NFTDeployer {
    // Struct to store deployment details
    struct DeploymentDetails {
        string name;
        string symbol;
        string baseURI;
        uint256 price;
        uint256 maxSupply;
        address deployer;
        uint256 timestamp;
        bool exists;
    }

    // Event to log deployments
    event NFTDeployed(
        address indexed deployedAddress,
        string name,
        string symbol,
        string baseURI,
        uint256 price,
        uint256 maxSupply,
        address indexed deployer,
        uint256 timestamp
    );

    // Mapping from deployed address to deployment details
    mapping(address => DeploymentDetails) public deploymentDetails;
    // Array to keep track of all deployed addresses for enumeration
    address[] private deployedAddresses;

    /**
     * @dev Deploys a new NFT collection contract
     * @param name_ The name of the NFT collection
     * @param symbol_ The symbol of the NFT collection
     * @param baseURI_ The base URI for token metadata
     * @param price_ Initial price for minting (in wei)
     * @param maxSupply_ Maximum supply of tokens
     * @return deployedAddress The address of the newly deployed contract
     */
    function deploy(
        string memory name_,
        string memory symbol_,
        string memory baseURI_,
        uint256 price_,
        uint256 maxSupply_
    ) external returns (address deployedAddress) {
        // Deploy new NFT collection
        StandardERC721A nftContract = new StandardERC721A(
            name_,
            symbol_,
            baseURI_,
            price_,
            maxSupply_
        );
        deployedAddress = address(nftContract);
        
        // Store deployment details
        deploymentDetails[deployedAddress] = DeploymentDetails({
            name: name_,
            symbol: symbol_,
            baseURI: baseURI_,
            price: price_,
            maxSupply: maxSupply_,
            deployer: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });
        
        // Add to addresses array for enumeration
        deployedAddresses.push(deployedAddress);
        
        // Emit deployment event
        emit NFTDeployed(
            deployedAddress,
            name_,
            symbol_,
            baseURI_,
            price_,
            maxSupply_,
            msg.sender,
            block.timestamp
        );

        return deployedAddress;
    }

    /**
     * @dev Returns the number of deployments made
     */
    function getDeploymentCount() external view returns (uint256) {
        return deployedAddresses.length;
    }

    /**
     * @dev Returns all deployment addresses
     */
    function getAllDeployments() external view returns (address[] memory) {
        return deployedAddresses;
    }

    /**
     * @dev Checks if an address is a deployed NFT collection
     */
    function isDeployedCollection(address collection) external view returns (bool) {
        return deploymentDetails[collection].exists;
    }

    /**
     * @dev Returns deployment details for a specific address
     */
    function getDeploymentDetails(address collection) 
        external 
        view 
        returns (
            string memory name,
            string memory symbol,
            string memory baseURI,
            uint256 price,
            uint256 maxSupply,
            address deployer,
            uint256 timestamp
        ) 
    {
        require(deploymentDetails[collection].exists, "Collection does not exist");
        DeploymentDetails memory details = deploymentDetails[collection];
        return (
            details.name,
            details.symbol,
            details.baseURI,
            details.price,
            details.maxSupply,
            details.deployer,
            details.timestamp
        );
    }
}