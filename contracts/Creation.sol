    pragma solidity ^0.4.25;
    
   import "./ERC721.sol";
    contract Creation  {
     event Transfer(address indexed _from, address indexed _to, uint256 indexed _tokenId);
        
        int basiclife=20;

        event NewHero(uint heroId, string name);

        struct hero  { // ta periexomena enos hrwa
            string name;
            int life;
            int lvl;
            int xp;
            int attack;
            int winCount;
            int lossCount;
            int herodmg;
        }
        hero[] public heroes; 

        struct enemy {  // ta periexomena enos TERATOS
            string name;
            int life;
            int lvl;
            int xp;
            int attack;
            int mondmg;
        }
        enemy[] public enemies;

        struct item  { 
            int uid;
            int sellable;
            uint price;
        }
        item[] public items;

      mapping (uint => address) public itemtoowner;    
      mapping (uint => address) public herotoowner;
      mapping (address => uint) public  heroCount;
      mapping (address => uint) public  itemCount;
      mapping (uint => address) public monstertoowner;
      mapping(address => mapping (address => uint256)) public allowed;
      uint public monsterCount; 
        
        function createhero(string memory _name) public  {              //function to create a hero
         require(heroCount[msg.sender] == 0);                           //user can create a hero only if he hasen't one
           uint id= heroes.push(hero(_name,basiclife,1,0,10,0,0,0))-1;  //add hero in the array of heroes 
           herotoowner[id] = msg.sender;                                //maps the id with the address of the user that created him 
           heroCount[msg.sender]++;                                     //
           emit NewHero(id, _name);
        }
         function enemyScrab(int _herolvl) public  { 
           uint id=enemies.push(enemy("Small crab",15*_herolvl,_herolvl,7*_herolvl,5*(_herolvl*_herolvl),0))-1;
           monstertoowner[id] = msg.sender;
           monsterCount++; 
        }
        function enemyBcrab(int _herolvl) public  {
           uint id=enemies.push(enemy("Big crab",20*_herolvl,_herolvl,14*_herolvl,5*(_herolvl*_herolvl),0))-1; 
           monstertoowner[id] = msg.sender;
           monsterCount++;
        }

          function createitem() public  { 
          int ran = randNum(3);
              uint id1=items.push(item(ran,0,0 ether))-1; 
           itemtoowner[id1] = msg.sender;
           itemCount[msg.sender]++;
          }
           
           function getitemsByOwner(address _owner) external view returns( uint[] memory ) { //sinartisi gia euresi id kai emfanisi tou hrwa
             uint[] memory result = new uint[](itemCount[_owner]);
            uint counter = 0;
            for (uint i = 0; i < items.length; i++) {
            if (itemtoowner[i] == _owner) {
              result[counter] = i;
              counter++;
                   }
                  }
                return result;
              }
              function tosell(uint _itemid,uint _price) public{
                  item storage myitem = items[_itemid];
                require(msg.sender == itemtoowner[_itemid] || _itemid == allowed[msg.sender][msg.sender]);
                require(myitem.sellable ==0);
                  myitem.price= _price;
                  myitem.sellable = 1;
              }
                function cancelsell(uint _itemid) public{
                require(msg.sender == itemtoowner[_itemid]);
                  item storage myitem = items[_itemid];
                   require(myitem.sellable ==1);
                  myitem.sellable = 0;
              }
               function buyit(address _from, address _to,uint _tokenId) private{
                  itemCount[_to]++;
                  itemCount[_from]--;
                  itemtoowner[_tokenId] = _to;
                  cancelsell(_tokenId);
              }
               function transferFrom(address _from, address _to, uint256 _tokenId) external payable{
                    item storage myitem = items[_tokenId];
                    uint priceof = myitem.price; 
                  require(msg.value > priceof );
                  require(_from != _to);
                  require(myitem.sellable ==1);
                  _from.transfer(msg.value);
                   Transfer(_from, _to, _tokenId);
                  buyit( _from,  _to, _tokenId);
               }
            function retarrray() external view returns (uint[] memory) {
                if (items.length <7 ){
                     uint[] memory result = new uint[](items.length);
                     for (uint i = 0; i < 7; i++) {
                  if (i ==items.length){
                    return result; 
                  }
                  result[i] = i;
                }
                 return result;
                } else {
                     uint[] memory result2 = new uint[](7);
                     for (uint j = 0; j < 7; j++) {
                  if (j ==items.length){
                    return result2;
                  }
                  result2[j] = j;
                }
                 return result2;
                } 
            }
           function getHerosByOwner(address owner) external view returns( uint ) { //sinartisi gia euresi id kai emfanisi tou hrwa
            uint result =999999;
            for (uint i = 0; i < heroes.length; i++) {
                  if (herotoowner[i] == owner) {
                    result = i;
                    break;
                    }
                    }
            return result;
            }
            function getmonstersByOwner(address owner) external view returns( uint ) { //sinartisi gia euresi id kai emfanisi tou teratos
            uint result =0;
            for (uint i = enemies.length ; i > 0 ; i--) {
                  if (monstertoowner[i] == owner) {
                    result = i;
                    break;
              }
            }
            return result;
            }
            
            uint nonce=0;
       
       function randNum(int _num) private   returns(int) {  //sinartisi gia tixaies times
        int randomnumber = int(keccak256(abi.encodePacked(now, msg.sender, nonce))) % _num;
        if (randomnumber <=0) {
            randomnumber=(-1)*randomnumber;
        }
        nonce++;
        return randomnumber;
        }  
          function randNum2(uint _num) external  view returns(uint) {  //sinartisi gia tixaies times
        uint randomnumber = uint(keccak256(abi.encodePacked(now, msg.sender, nonce))) % _num;
        
        nonce++;
        uint result = randomnumber;
        return result;
        }  


        function attack_hero(uint _heroid, uint _monsterid, int _num  ) external  { 
          
          hero storage myhero = heroes[_heroid];
          enemy storage monster = enemies[_monsterid];
          int attackofhero=0;
          
		      int attackofmonster=randNum(monster.attack) + 5;
          if(_num==0 ) { 
           attackofhero=randNum(myhero.attack) +5;
          }
         
            monster.life=monster.life - attackofhero;
          
          if(monster.life>0){
            myhero.life=myhero.life - attackofmonster;
          }else{
            myhero.life=myhero.life;
          }
          myhero.herodmg=attackofhero;
          monster.mondmg=attackofmonster;
		  
		      if (myhero.life <= 0 ) { 
           myhero.lossCount++; 
          }
          if (monster.life <= 0 && myhero.life >= 1) { 
            myhero.winCount++;
            myhero.xp+=monster.xp;
            if (randNum(100) > 0 ){ 
                   createitem();
            }
            if (myhero.xp>=10+2*myhero.lvl){ 
              myhero.lvl++;
              myhero.xp=0; 
              myhero.life=basiclife*myhero.lvl; 
              myhero.attack=10*myhero.lvl;
            }
         }
        }
        function resurrection(uint _heroid) public { 
             hero storage myhero = heroes[_heroid];
             myhero.life=basiclife*myhero.lvl;
        }
        
          
                function gethero(uint256 _id) external view returns (
            string name,
            int life,
            int lvl,
            int xp,
            int attack,
            int winCount,
            int lossCount,
            int herodmg
            ){
              hero storage kit = heroes[_id];
              name = string(kit.name);
              life = int(kit.life);
              lvl = int(kit.lvl);
              xp = int(kit.xp);
              attack = int(kit.attack);
              winCount = int(kit.winCount);
              lossCount = int(kit.lossCount);
              herodmg = int(kit.herodmg);
              
            }  
                  event Approval(address indexed _owner, address indexed _approved, uint256 _tokenId); 
                  
                function balanceOf(address _owner)  returns (uint256) {
                return itemCount[_owner];
                }
                function ownerOf(uint256 _tokenId)  returns (address) {
                    address owner = itemtoowner[_tokenId];
                 return owner;
                }
                function approve(address _to, uint256 _tokenId){
                address owner = ownerOf(_tokenId);
                require(msg.sender == owner );
                 require(msg.sender != _to);
                allowed[msg.sender][_to] = _tokenId;
                Approval(msg.sender, _to, _tokenId);
                }
    }             
          