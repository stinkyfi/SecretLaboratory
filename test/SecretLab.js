const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");

describe("OBLOMOV Secret Laboratory", function () {
  let SecretLab;
  let Warrant;
  let Peno;
  let owner;
  let addr1;
  let addr2;
  let addrs;
  let provider;

  beforeEach(async function () {
    provider = waffle.provider;
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Deploy Secret Lab
    SecretLab = await ethers.getContractFactory("SecrectLaboratory");
    SecretLab = await SecretLab.deploy(owner.address);
    await SecretLab.deployed();

    // Deploy Warrant Contract
    Warrant = await ethers.getContractFactory("Warrants");
    Warrant = await Warrant.deploy("", SecretLab.address);
    await Warrant.deployed();

    // Deploy Spicy Peno Contract
    Peno = await ethers.getContractFactory("SpicyPeno");
    Peno = await Peno.deploy(owner.address,"");
    await Peno.deployed();
  });

  describe("Deployment", function () {
    it("Verify SecretLab Admin", async function () {
      expect(await SecretLab.hasRole(SecretLab.DEFAULT_ADMIN_ROLE(), owner.address)).to.equal(true);
    });

    it("Verify SecretLab Scientist", async function () {
        expect(await SecretLab.hasRole(SecretLab.SCIENCE_ROLE(), owner.address)).to.equal(true);
      });
  });

  describe("Laboratory", function () {
    it("Verify Laboratory Shutoff", async function () {
        await SecretLab.LaboratoryShutoff(false);
        await expect(SecretLab.newExperiment("WARRANT","Secret Lab Warrants",Warrant.address,true,10000000000000000n)).to.be.revertedWith('Pausable: paused');
    });
  });

  describe("Experiments", function () {
    it("Add Experiment #0 ($WARRANT)", async function () {
        await SecretLab.newExperiment("WARRANT","Secret Lab Warrants",Warrant.address,true,10000000000000000n);
    });

    it("Verify Experiment Contract Address", async function () {
        await SecretLab.newExperiment("WARRANT","Secret Lab Warrants",Warrant.address,true,10000000000000000n);
        let experiment = await SecretLab.getExperiment(0);
        expect(experiment.contractAddress).to.equal(Warrant.address);
    });

    it("Verify Scientist", async function () {
        await SecretLab.newExperiment("WARRANT","Secret Lab Warrants",Warrant.address,true,10000000000000000n);
        let experiment = await SecretLab.getExperiment(0);
        expect(experiment.scientist).to.equal(owner.address);
    });

    it("Verify Experiment Shutoff", async function () {
        await SecretLab.newExperiment("WARRANT","Secret Lab Warrants",Warrant.address,true,10000000000000000n);
        await SecretLab.ExperimentShutoff(0, false);
        let experiment = await SecretLab.getExperiment(0);
        expect(experiment.isActive).to.equal(false);
    });
  });

  describe("ClinicalTrials", function () {
    it("Add Experiment #0", async function () {
        await SecretLab.newExperiment("WARRANT","Secret Lab Warrants",Warrant.address,true,10000000000000000n);
    });

    it("Verify Single ERC-1155 Mint", async function () {
        await SecretLab.newExperiment("WARRANT","Secret Lab Warrants",Warrant.address,true,10000000000000000n);
        overrides = {value: ethers.utils.parseEther("0.01")};
        await SecretLab.ClinicalTrials(0, 1, overrides);
        expect(await Warrant.balanceOf(owner.address, 0)).to.be.equal(1);
    });

    it("Verify Batch ERC-1155 Mint", async function () {
        await SecretLab.newExperiment("WARRANT","Secret Lab Warrants",Warrant.address,true,10000000000000000n);
        overrides = {value: ethers.utils.parseEther("0.05")};
        await SecretLab.ClinicalTrials(0, 5, overrides);
        expect(await Warrant.balanceOf(owner.address, 0)).to.be.equal(5);
    });

    it("Add Experiment #1", async function () {
        await SecretLab.newExperiment("WARRANT","Secret Lab Warrants",Warrant.address,true,10000000000000000n);        
        await SecretLab.newExperiment("PENO","Secret Laboratory Experiment: Spicy Peno",Peno.address,true,ethers.utils.parseEther("0.069"));
    });

    it("Verify Single ERC-721A Mint", async function () {
        await SecretLab.newExperiment("WARRANT","Secret Lab Warrants",Warrant.address,true,10000000000000000n);
        await SecretLab.newExperiment("PENO","Secret Laboratory Experiment: Spicy Peno",Peno.address,true,ethers.utils.parseEther("0.069"));
        overrides = {value: ethers.utils.parseEther("0.069")};
        await SecretLab.ClinicalTrials(1, 1, overrides);
        expect(await Peno.ownerOf(0)).to.be.equal(owner.address);
    });

    it("Verify Batch ERC-721A Mint", async function () {
        await SecretLab.newExperiment("WARRANT","Secret Lab Warrants",Warrant.address,true,10000000000000000n);        
        await SecretLab.newExperiment("PENO","Secret Laboratory Experiment: Spicy Peno",Peno.address,true,ethers.utils.parseEther("0.069"));
        overrides = {value: ethers.utils.parseEther("0.345")};
        await SecretLab.ClinicalTrials(1, 5, overrides);
        expect(await Peno.ownerOf(0)).to.be.equal(owner.address);
    });

  });
});