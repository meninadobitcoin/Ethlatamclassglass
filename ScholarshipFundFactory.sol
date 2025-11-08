// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Importações do Zama FHEVM
import "fhe.sol";

// Importações do OpenZeppelin para o NFT (RWA)
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; // Para aceitar o dinheiro (USDC)

// Importa o contrato de distribuição que será implantado
import "./DistributionContract.sol";

/**
 * @title ScholarshipFundFactory
 * @dev Permite que 'Owners' (universidades) criem Fundos de Bolsa como NFTs (RWA).
 * Cada fundo tem seu próprio contrato de distribuição com regras de equidade confidenciais.
 */
contract ScholarshipFundFactory is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _fundIds;

    // Endereço do Oráculo Chainlink que será passado aos contratos filhos
    address public chainlinkOracle;
    
    // Endereço do token de pagamento (ex: USDC)
    IERC20 public paymentToken;

    // Struct para armazenar os detalhes do fundo
    struct FundDetails {
        address distributionContract;
        uint256 totalValue;
        // A regra de equidade (ex: 1="negro") é armazenada
        // de forma confidencial *dentro* do DistributionContract.
    }

    // Mapeia o ID do NFT (Fund ID) para seus detalhes
    mapping(uint256 => FundDetails) public funds;

    event FundCreated(uint256 indexed fundId, address indexed distributionContract, uint256 totalValue);

    /**
     * @param _oracle Endereço do Oráculo Chainlink.
     * @param _paymentToken Endereço do contrato do token (ex: USDC).
     */
    constructor(address _oracle, address _paymentToken) 
        ERC721("Scholarship Fund NFT", "SCHOLAR-RWA") 
        Ownable(msg.sender) // Define o 'owner' (deployer)
    {
        chainlinkOracle = _oracle;
        paymentToken = IERC20(_paymentToken);
    }

    /**
     * @dev Cria um novo fundo de bolsa.
     * @param encryptedCategory A categoria de equidade alvo (ex: 1 para "negro"),
     * JÁ CRIPTOGRAFADA pelo frontend (Zama.js) e enviada como 'bytes'.
     * @param totalValue O valor total em tokens (ex: 10000 USDC) a ser alocado.
     */
    function createFund(bytes calldata encryptedCategory, uint256 totalValue)
        external
        onlyOwner // Apenas a universidade pode criar fundos
    {
        // 1. Descomprime a regra de equidade criptografada
        // O FHEVM usa isso para criar um tipo Fheuint8 confidencial.
        Fheuint8 requiredCategory = Fheuint8.decompress(encryptedCategory);

        // 2. Cria (implanta) um novo contrato de distribuição para este fundo
        DistributionContract distContract = new DistributionContract(
            chainlinkOracle,
            address(paymentToken),
            requiredCategory,
            totalValue,
            msg.sender // Define a universidade como admin do contrato de distribuição
        );

        // 3. Puxa os fundos (USDC) da universidade para o novo contrato
        // A universidade deve ter chamado 'approve()' antes no token USDC.
        require(
            paymentToken.transferFrom(msg.sender, address(distContract), totalValue),
            "Token transfer failed"
        );

        // 4. Minta o NFT (RWA) para a carteira da universidade
        _fundIds.increment();
        uint256 newFundId = _fundIds.current();
        _safeMint(msg.sender, newFundId);

        // 5. Armazena os detalhes do fundo
        funds[newFundId] = FundDetails({
            distributionContract: address(distContract),
            totalValue: totalValue
        });

        emit FundCreated(newFundId, address(distContract), totalValue);
    }

    // --- Funções de Gerenciamento ---

    function setChainlinkOracle(address _oracle) external onlyOwner {
        chainlinkOracle = _oracle;
    }

    function getDistributionContract(uint256 fundId) external view returns (address) {
        require(_exists(fundId), "Fund does not exist");
        return funds[fundId].distributionContract;
    }
}