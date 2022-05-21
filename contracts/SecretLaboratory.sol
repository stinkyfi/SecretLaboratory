// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// Security
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
// Utility
import "@openzeppelin/contracts/utils/Counters.sol";
// LabToken Interfaces
interface ILabToken {
    function mintExperiment(address testSubject, uint256 testAmount) external;
}

contract SecrectLaboratory is AccessControl, Pausable {
    using Counters for Counters.Counter;

    // SCIENCE_ROLE has access to creating new Lab Experiments
    bytes32 public constant SCIENCE_ROLE = keccak256("SCIENCE_ROLE");
    // Experiment
    struct Experiment {
        uint256 id;
        string code;
        string name;
        address contractAddress;
        bool isActive;
        address scientist;
        uint256 price;
    }
    // Experiments
    mapping (uint256 => Experiment) public experimentList;
    // Experiment # Counter
    Counters.Counter public _experimentId;
    // Royalties paid to
    address private beneficiary;

    /**
     * @notice Construct The Secret Laboratory
     * @param _beneficiary Beneficiary Address
     */
    constructor(address _beneficiary) {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(SCIENCE_ROLE, _msgSender());
        beneficiary = _beneficiary;
    }

    function ClinicalTrials(uint256 _expId, uint256 _amount) public payable whenNotPaused {
        require(experimentList[_expId].isActive, "The requested Experiment is not Active");
        uint256 bundlePrice = experimentList[_expId].price * _amount;
        require(bundlePrice == msg.value,"ETH value is incorrect");
        ILabToken(experimentList[_expId].contractAddress).mintExperiment(_msgSender(), _amount);
        payable(beneficiary).transfer(bundlePrice);
    }

    function newExperiment(
        string memory _code, 
        string memory _name, 
        address _address, 
        bool _active,
        uint256 _price
    ) public onlyRole(SCIENCE_ROLE) whenNotPaused {
        Experiment memory newX;
        newX.id = _experimentId.current();
        newX.code = _code;
        newX.name =  _name;
        newX.contractAddress = _address;
        newX.isActive = _active;
        newX.scientist = _msgSender();
        newX.price = _price;
        experimentList[newX.id] = newX;
        _experimentId.increment();
    }

    /**
     * @notice Returns the Experiment Object
     * @param _exId the Experiment ID Number
     */
    function getExperiment(uint256 _exId) public view returns(Experiment memory) {
        return experimentList[_exId];
    }

    function ExperimentShutoff(uint256 _exId, bool _status) public onlyRole(SCIENCE_ROLE) {
        experimentList[_exId].isActive = _status;
    }

    function LaboratoryShutoff(bool _status) public onlyRole(DEFAULT_ADMIN_ROLE) {
        if(_status){
             _unpause();
        } else {
            _pause();
        }
    }
}