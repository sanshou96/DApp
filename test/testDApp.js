const Creation = artifacts.require("Creation");
const utils = require("./utils");
const heroNames = ["hero 1", "hero 2"];
contract("Creation", (accounts) => {
    let [alice, bob] = accounts;
    let contractInstance;
    beforeEach(async () => {
        contractInstance = await Creation.new();
    });
    it("should be able to create a new hero", async () => {
        const result = await contractInstance.createhero(heroNames[0], {from: alice});
        assert.equal(result.receipt.status, true);
        assert.equal(result.logs[0].args.name,heroNames[0]);
    })
    it("should be able to create a small crab", async () => {
        const result = await contractInstance.enemyScrab(1, {from: alice});
        assert.equal(result.receipt.status, true);
    })
    
    it("should not allow two heroes", async () => {
        await contractInstance.createhero(heroNames[0], {from: alice});
        await utils.shouldThrow(contractInstance.createhero(heroNames[1], {from: alice}));
    })
    it("heroes should be able to attack and get attacked by small crab", async () => {
        let result;
        result = await contractInstance.createhero(heroNames[0], {from: alice});
        const heroId = await contractInstance.getHerosByOwner(alice);
        result = await contractInstance.enemyScrab(1, {from: alice});
        const monsterId = await contractInstance.getmonstersByOwner(alice);
        
        await contractInstance.attack_hero(heroId, monsterId,0, {from: alice});
        //TODO: replace with expect
        const sanshou = contractInstance.heroes(contractInstance.getHerosByOwner);
        assert.equal(result.receipt.status, true);
    })
    it("should find owner's hero", async () => {
        await contractInstance.createhero(heroNames[0], {from: alice});
        const heroId = await contractInstance.getHerosByOwner(alice);
        assert.equal(heroId,0)
        await contractInstance.createhero(heroNames[1], {from: bob});
        const heroId2 = await contractInstance.getHerosByOwner(bob);
        assert.equal(heroId2,1)
    })
    it("should rdasd",async () => {
        let result;
        await contractInstance.createitem( {from: alice});
        await contractInstance.tosell(0);
        

        result = await contractInstance.findsellable(0);
        assert.equal(result.logs[0].args.result, 0);
    })
    it("should resurrect the hero", async () => {
        let result;
        await contractInstance.createhero(heroNames[0], {from: alice});
        const heroId = await contractInstance.getHerosByOwner(alice);
        result = await contractInstance.resurrection(heroId);
        assert.equal(result.receipt.status, true);
    })
    
    })
   

