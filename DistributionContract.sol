// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Importações do Zama FHEVM
import "fhe.sol";

// Importações do Chainlink (para segurança)
import "@chainlink/contracts/src/v0.8/access/ConfirmedOwner.sol";

// Interface para o token de pagamento
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title DistributionContract
 * @dev Gerencia a verificação confidencial (Zama) e a entrada de dados (Chainlink).
 * Este contrato é implantado pela Factory e controla um único fundo.
 */
contract DistributionContract is ConfirmedOwner {
    using FHE for Fheuint8; // Habilita métodos .eq() em Fheuint8
    using FHE for Fhebool; // Habilita métodos .decrypt() em Fhebool

    // --- Variáveis de Estado ---

    address public chainlinkOracle;
    IERC20 public paymentToken; // ex: USDC
    address public universityAdmin; // Endereço da universidade (owner)

    uint256 public totalFundValue;
    uint256 public amountPerStudent;
    uint256 public verifiedStudentCount;

    // --- REGRAS CONFIDENCIAIS (ZAMA FHEVM) ---

    // A regra que este fundo deve seguir (ex: 1="negro").
    // Este valor é confidencial e nunca é revelado.
    Fheuint8 public requiredCategory;

    // Mapeia o endereço do aluno para um booleano CRIPTOGRAFADO (ele se qualifica?).
    // O público só vê dados criptografados.
    mapping(address => Fhebool) public isVerifiedAndEligible;

    // --- Fim das Regras Confidenciais ---

    // Mapeamento público para evitar saques duplos
    mapping(address => bool) public hasClaimed;

    // Eventos
    event StudentVerified(address indexed student, bytes encryptedResult);
    event BursaryClaimed(address indexed student, uint256 amount);


    /**
     * @param _oracle Endereço do Oráculo Chainlink.
     * @param _token Endereço do token (USDC).
     * @param _requiredCategory A regra de equidade CRIPTOGRAFADA.
     * @param _totalValue O valor total que este contrato gerenciará.
     * @param _admin O endereço da universidade/factory.
     */
    constructor(
        address _oracle,
        address _token,
        Fheuint8 _requiredCategory,
        uint256 _totalValue,
        address _admin
    ) ConfirmedOwner(_admin) {
        chainlinkOracle = _oracle;
        paymentToken = IERC20(_token);
        requiredCategory = _requiredCategory;
        totalFundValue = _totalValue;
        universityAdmin = _admin;
    }

    // --- FUNÇÃO PRINCIPAL: CHAMADA PELO CHAINLINK ---

    /**
     * @dev PONTO DE ENTRADA DO CHAINLINK (Bounty #3)
     * Chamado pelo nó do Chainlink após o backend da universidade aprovar.
     * Isso faz uma MUDANÇA DE ESTADO, qualificando para o prêmio.
     *
     * @param studentWallet O endereço do aluno.
     * @param encryptedStudentCategory A categoria do aluno (criptografada pelo Zama.js).
     */
    function fulfillStudentVerification(
        address studentWallet,
        bytes calldata encryptedStudentCategory
    ) external {
        // 1. Garante que só o oráculo Chainlink chame esta função
        require(msg.sender == chainlinkOracle, "Only Chainlink Oracle");
        
        // 2. Garante que o aluno não foi verificado ainda
        require(
            Fhebool.isInitialized(isVerifiedAndEligible[studentWallet]) == false,
            "Student already verified"
        );

        // 3. Descomprime o dado do aluno vindo do Chainlink
        Fheuint8 studentCategory = Fheuint8.decompress(encryptedStudentCategory);

        // 4. A MÁGICA DO ZAMA (Bounty #1 - Privacidade)
        // Compara a regra do fundo (confidencial) com o dado do aluno (confidencial).
        // Ninguém (nem o nó, nem a blockchain) sabe qual é a categoria.
        Fhebool isEligible = studentCategory.eq(requiredCategory);

        // 5. Armazena o *resultado criptografado* no estado
        isVerifiedAndEligible[studentWallet] = isEligible;

        // 6. Atualiza contagem (apenas se for elegível - decisão de design)
        // Para fazer isso, precisamos descriptografar o booleano.
        if (isEligible.decrypt()) {
            verifiedStudentCount++;
        }

        emit StudentVerified(studentWallet, isEligible.compress());
    }

    // --- FUNÇÃO PRINCIPAL: CHAMADA PELO ALUNO ---

    /**
     * @dev FUNÇÃO DE SAQUE (Pode ser chamada pelo Flow - Bounty #4)
     * O aluno verificado chama esta função para sacar sua parte da bolsa.
     */
    function claimBursary() external {
        require(!hasClaimed[msg.sender], "Bursary already claimed");

        // 1. Pega o resultado criptografado do aluno
        Fhebool encryptedResult = isVerifiedAndEligible[msg.sender];
        require(Fhebool.isInitialized(encryptedResult), "Student not verified");

        // 2. DESCRIPTOGRAFA o resultado (só é possível dentro do FHEVM)
        // Isso revela apenas "true" ou "false", não a categoria original.
        bool isEligible = encryptedResult.decrypt();

        // 3. Verifica se o aluno é elegível
        require(isEligible, "Student not eligible for this fund");
        
        // 4. Calcula o valor a ser pago (pode ser definido de outra forma)
        // Esta é uma lógica simples; pode ser melhorada.
        require(verifiedStudentCount > 0, "No verified students");
        uint256 amountToClaim = totalFundValue / verifiedStudentCount; 
        
        // 5. Marca como sacado e envia o dinheiro
        hasClaimed[msg.sender] = true;
        require(
            paymentToken.transfer(msg.sender, amountToClaim),
            "Transfer failed"
        );

        emit BursaryClaimed(msg.sender, amountToClaim);
    }
    
    // --- Funções Administrativas ---
    
    /**
     * @dev Permite ao admin (universidade) resgatar fundos não utilizados
     * após o término do período de bolsas. (Requer lógica de tempo).
     */
    function reclaimFunds() external onlyOwner {
        // Adicionar lógica de data (ex: após 1 ano)
        // require(block.timestamp > deadline, "Claim period not over");
        
        uint256 remainingBalance = paymentToken.balanceOf(address(this));
        if (remainingBalance > 0) {
            paymentToken.transfer(universityAdmin, remainingBalance);
        }
    }

    function setChainlinkOracle(address _oracle) external onlyOwner {
        chainlinkOracle = _oracle;
    }
}