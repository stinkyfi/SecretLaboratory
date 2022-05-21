// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Context.sol";

contract Warrants is Context, AccessControl, ERC1155, Pausable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    address public secretLab;
    string public name = "OBLOMOV Warrants";
    string public symbol = "WARRANT";
    uint256 public mint_id;

    /**
     * @dev Grants `DEFAULT_ADMIN_ROLE`, `MINTER_ROLE`, and `PAUSER_ROLE` to the account that
     * deploys the contract.
     */
    constructor(string memory uri, address _labAddress) ERC1155(uri) {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(MINTER_ROLE, _msgSender());
        _setupRole(PAUSER_ROLE, _msgSender());
        secretLab = _labAddress;
        mint_id = 0;
    }

    function setURI(string memory newuri) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _setURI(newuri);
    }

    function burn(
        address account,
        uint256 id,
        uint256 value
    ) public whenNotPaused {
        require(account == _msgSender() || isApprovedForAll(account, _msgSender()), "Caller is not owner nor approved");

        _burn(account, id, value);
    }

    function burnBatch(
        address account,
        uint256[] memory ids,
        uint256[] memory values
    ) public whenNotPaused {
        require(account == _msgSender() || isApprovedForAll(account, _msgSender()), "Caller is not owner nor approved");

        _burnBatch(account, ids, values);
    }

    function mintExperiment(address testSubject, uint256 testAmount) external {
        require(_msgSender() == secretLab, "Only the Secret Lab can call this function");
        _mint(testSubject, mint_id, testAmount, '');
    }

    function changeMint(uint256 _id) public onlyRole(DEFAULT_ADMIN_ROLE) {
        mint_id = _id;
    }

    /**
     * @dev Pauses all token burns.
     *
     * See {ERC1155Pausable} and {Pausable-_pause}.
     *
     * Requirements:
     *
     * - the caller must have the `PAUSER_ROLE`.
     */
    function pauseBurn() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev Unpauses all token burns.
     *
     * See {ERC1155Pausable} and {Pausable-_unpause}.
     *
     * Requirements:
     *
     * - the caller must have the `PAUSER_ROLE`.
     */
    function unpauseBurn() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view override(AccessControl, ERC1155) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}