App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    heroes: [],
    enemies: [],
    items: [],
    heroId: null,
    monsterId: null,
    itemId: [],
    rand: null,
    rand2: 0,
    heroesLife: null,
    monstersLife: null,
    actions: [],
    checke: [],
    searchfun: [],
    searchfun1: [],
    helper: [],
    helper1: [],
    buyid: [],
    
    init: async function() {
        await App.initWeb3();
        await App.initContract();
        console.log("App initialized.");
    },
    initWeb3: async function() {
        if (window.ethereum) {
            App.web3Provider = window.ethereum;
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                console.log("Web3 provider initialized with MetaMask.");
            } catch (error) {
                console.error("User denied account access");
            }
        } else if (window.web3) {
            App.web3Provider = window.web3.currentProvider;
            console.log("Web3 provider initialized with legacy web3.");
        } else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
            console.log("Web3 provider initialized with local node.");
        }
        web3 = new Web3(App.web3Provider);
        return App.initContract();
    },
    initContract: async function() {
        try {
            const Creation = await $.getJSON("Creation.json");
            if (!Creation) {
                console.error("Failed to load contract artifact.");
                return;
            }
            App.contracts.Creation = TruffleContract(Creation);
            App.contracts.Creation.setProvider(App.web3Provider);
    
            // Ορίστε τη σωστή διεύθυνση του contract
            const contractAddress = "0x09415AE50Deca4E7222954f8dc0ABb3Ef457E816"; // Η σωστή διεύθυνση
            App.contracts.Creation.at(contractAddress).then(function(instance) {
               
                creationInstance = instance;
                return App.render();
            }).catch(function(error) {
                console.error("Failed to set contract address:", error);
            });
        } catch (error) {
            console.error("Failed to load contract:", error);
        }
    },
    monsterRender: function() {
        if (!App.contracts.Creation) {
            console.error("Contract not initialized.");
            return;
        }
    
        web3.eth.getAccounts(function(err, accounts) {
            if (err === null && accounts.length > 0) {
                App.account = accounts[0];
                $("#accountAddress").html("Your Account: " + accounts[0]);
            }
        });
        var enemyspot = $("#enemyspot");
        enemyspot.empty();

        App.contracts.Creation.deployed().then(function(instance) {
            
            console.log("testm",App.account)
            creationInstance = instance;
            return creationInstance.getmonstersByOwner(App.account);
        }).then(function(getmonstersByOwner) {
            App.monsterId = getmonstersByOwner;
            console.log("mon",getmonstersByOwner.c[0])
            return creationInstance.enemies(getmonstersByOwner.c[0])
        }).then(function(enemies) {
            console.log(enemies)
            App.enemies[App.monsterId] = enemies;
            var name = enemies[0];
            var life = enemies[1];
            var lvl = enemies[2];
            var xp = enemies[3];
            var atk = enemies[4];

            var enemyTemplate = "<tr ><td colspan='2'><img src = './images/" + App.randNum2 
            + ".jpg' width ='200px'></td></tr><tr><td> Name</td><td>: " + name +
             "</td></tr><tr><td>Health Points</td><td>: " + life + 
             " HP</td></tr><tr><td>Level</td><td>: " + lvl + "</td></tr><tr><td>Experiance</td><td>: "
              + xp + "</td></tr><tr><td>Attack</td><td>: " + atk;
            enemyspot.append(enemyTemplate);

            App.actions.unshift("You've taken " + App.enemies[App.monsterId][5] + " dmg");
            App.actionRender();
        }).then(function() {

            if (App.enemies[App.monsterId][1] <= 0 && App.heroes[1] >= 0) {
                App.actions.unshift("You have won!!!");
                App.actionRender();
                isCreated = 0;
                var enemyspot = $("#enemyspot");
                enemyspot.empty();
            }
            if (App.heroes[1] <= 0) {

                App.actions.unshift("You have lost!!!");
                App.actionRender();
                var enemyspot = $("#enemyspot");
                enemyspot.empty();
                App.resurrection();
                isCreated = 0;
            }
        });

    },

    itemRender: function() {


        var inneritemwrap = $(".inneritemwrap");
        inneritemwrap.empty();
        App.searchfun1 = []
        App.helper = []
        App.contracts.Creation.deployed().then(function(instance) {
            instance.address= "0x09415AE50Deca4E7222954f8dc0ABb3Ef457E816"
            creationInstance = instance;
            return creationInstance.getitemsByOwner(App.account);
        }).then(function(getitemsByOwner) {
            App.itemId = getitemsByOwner;
            App.helper1 = []
            var searching1 = async function() {

                return creationInstance.items(getitemsByOwner[id])
            }

            for (id = 0; id < App.itemId.length; id++) {
                console.log(App.itemId.length)
                App.searchfun1.push(searching1(id))

            }

            function deepAll(array) {
                return new Promise((resolve, reject) => {
                    if (array instanceof Promise) {
                        array.then(resolve).catch(reject);
                    } else if (array.length === 0) {
                        resolve([]);
                    } else if (Array.isArray(array[0])) {
                        Promise.all(array.map(deepAll)).then(resolve).catch(reject);
                    } else {
                        Promise.all(array).then(resolve).catch(reject);
                    }
                });
            }
            deepAll(App.searchfun1).then(function(values) {
                App.helper = values;

                for (i = 0; i < App.itemId.length; i++) {


                    var uid = App.helper[i][0]
                    var sellable = App.helper[i][1]
                    var price = App.helper[i][2]
                    var sellornot;
                    var sellornot2;

                    if (sellable == 0) {
                        sellornot = "Sell"
                        sellornot2 = "<div class='forma' <form id='setprice' onsubmit='return false;' method='post' name='myForm1'><label>set price</label><input type='number' name='price1' id='price" 
                        + App.itemId[i] + "' /><input type='submit' name='sell' onclick='App.sellit(" + App.itemId[i] +
                         ")' /></form></div>"
                         sellornot3= ""
                    } else {
                        sellornot = " cancel sell"
                        sellornot2 = "<button onclick='App.cancelit(" + App.itemId[i] + ")'>" + sellornot + "</button>"
                        sellornot3 = "<tr><td>Price</td><td> " + price + " Ether</td></tr>"
                    }

                    var itemTemplate = "<table id='itemtable'> <tbody id='itemspot'><tr ><td colspan='2'><img src = './images/item" + uid +
                        ".jpg' width ='300px'></td></tr>"+ sellornot3+"<tr ><td colspan='2'>" + sellornot2 + "</td></tr></tbody> </table>";
                    inneritemwrap.append(itemTemplate);



                }
            });


        })


    },
    sellit: function(id) {
        App.showsell()
        console.log(id)
        console.log("price" + App.itemId[id])
        var pr = document.getElementById("price" + App.itemId[id]).value;
        console.log(pr)
        App.contracts.Creation.deployed().then(function(instance) {
            instance.address= "0x09415AE50Deca4E7222954f8dc0ABb3Ef457E816"
            creationInstance = instance;
            return creationInstance.tosell(id, pr);
        }).then(function() {
            App.itemRender();
        })

    },

    cancelit: function(id) {

        App.contracts.Creation.deployed().then(function(instance) {
            instance.address= "0x09415AE50Deca4E7222954f8dc0ABb3Ef457E816"
            creationInstance = instance;
            return creationInstance.cancelsell(id);
        }).then(function() {
            App.itemRender();
        })

    },
    buyit: function(id) {

        App.contracts.Creation.deployed().then(function(instance) {
            instance.address= "0x09415AE50Deca4E7222954f8dc0ABb3Ef457E816"
            creationInstance = instance;
            return instance.itemtoowner(id);
        }).then(function(itemtoowner) {
            console.log(itemtoowner)
            console.log(App.account)
            console.log(id)
            var pricefor = App.helper1[id][2];
            return creationInstance.transferFrom(itemtoowner, App.account, id, {
                from: App.account,
                value: web3.toWei(pricefor, 'ether')
            })


        }).then(function() {
            App.showsell()
        })
    },
    showsell: function() {
        if (!App.contracts.Creation) {
            console.error("Contract not initialized.");
            return;
        }
    
        var inneritemwrap1 = $(".inneritemwrap1");
        inneritemwrap1.empty();
        App.searchfun = [];
    
        App.contracts.Creation.deployed().then(function(instance) {
            instance.address= "0x09415AE50Deca4E7222954f8dc0ABb3Ef457E816"
            creationInstance = instance;
            return creationInstance.retarrray();
        }).then(function(retarrray) {
            App.itemId = retarrray;
            App.helper1 = [];
            var searching = async function() {
                return creationInstance.items(retarrray[id]);
            };
            for (id = 0; id < App.itemId.length; id++) {
                App.searchfun.push(searching(id));
                App.buyid[id] = App.itemId[id];
            }
    
            function deepAll1(array) {
                return new Promise((resolve, reject) => {
                    if (array instanceof Promise) {
                        array.then(resolve).catch(reject);
                    } else if (array.length === 0) {
                        resolve([]);
                    } else if (Array.isArray(array[0])) {
                        Promise.all(array.map(deepAll1)).then(resolve).catch(reject);
                    } else {
                        Promise.all(array).then(resolve).catch(reject);
                    }
                });
            }
    
            deepAll1(App.searchfun).then(function(values) {
                App.helper1 = values;
    
                for (i = 0; i < App.helper1.length; i++) {
                    var uid = App.helper1[i][0];
                    var sellable = App.helper1[i][1];
                    var price = App.helper1[i][2];
                    var idd = App.buyid[i];
                    console.log(uid);
                    if (sellable == 1) {
                        var itemTemplate1 = "<table id='itemtable'> <tbody id='itemspot'><tr ><td colspan='2'><img src = './images/item" + uid +
                            ".jpg' width ='200px'></td></tr><tr><td> Price</td><td>: " + price +
                            "</td></tr><tr><td colspan='2'><button onclick='App.buyit(" + idd + ")'>Buy it</button></td></tr> </tbody> </table>";
                        inneritemwrap1.append(itemTemplate1);
                    }
                }
            });
        }).catch(function(error) {
            console.error("Error showing sell items:", error);
        });
    },


    render: function() {
        if (!App.contracts.Creation) {
            console.error("Contract not initialized.");
            return;
        }
    
        web3.eth.getAccounts(function(err, accounts) {
            if (err === null && accounts.length > 0) {
                App.account = accounts[0];
                $("#accountAddress").html("Your Account: " + accounts[0]);
            }
        });
    
        var herospot = $("#herospot");
        herospot.empty();
        var herospot1 = $("#herospot1");
        herospot1.empty();
    
        App.showsell();
        App.itemRender();
    
        // Load contract data
        App.contracts.Creation.deployed().then(function(instance) {
            creationInstance = instance;
            console.log("test",App.account)
            return creationInstance.getHerosByOwner(App.account);
        }).then(function(getHerosByOwner) {
            App.heroId = getHerosByOwner[0];
            console.log("test1",getHerosByOwner.c[0])
            console.log("test",App.heroId)
            return creationInstance.gethero(getHerosByOwner.c[0]);
        }).then(function(heroes) {
            $("#charform").hide();
            $(".story").hide();
            console.log("C", heroes);
            App.heroes = heroes;
            var name = heroes[0];
            var life = heroes[1];
            var lvl = heroes[2];
            var xp = heroes[3];
            var atk = heroes[4];
            var winCount = heroes[5];
            var lossCount = heroes[6];
            var heroTemplate = "<tr ><td colspan='2'><img src = './images/happyfa.jpg' width ='200px'></td></tr><tr><td> Name</td><td>: " +
                name + "</td></tr><tr><td>Health Points</td><td>: " + life + " HP</td></tr><tr><td>Level</td><td>: " +
                lvl + "</td></tr><tr><td>Experiance</td><td>: " + xp + "</td></tr><tr><td>Attack</td><td>: " + atk + "</td></tr><tr><td>Win count</td><td>: " + winCount +
                "</td></tr><tr><td>lossCount</td><td>: " + lossCount;
                herospot.empty();
                herospot1.empty();
            herospot.append(heroTemplate);
            herospot1.append(heroTemplate);
            if (isCreated == 1) {
                App.actions.unshift("You dealt " + App.heroes[7] + " dmg");
                App.actionRender();
            }
        }).catch(function(error) {
            console.error("Error rendering hero data:", error);
        });
    },
    fight: function() {
        App.contracts.Creation.deployed().then(function(instance) {
            instance.address= "0x09415AE50Deca4E7222954f8dc0ABb3Ef457E816"
            creationInstance = instance;

            return creationInstance.attack_hero(App.heroId, App.monsterId, App.rand2);
        }).then(function(attack_hero) {
            App.render();

            App.rand2 = 0;
        }).then(function() {
            App.monsterRender();

        });
    },
    resurrection: function() {

        App.contracts.Creation.deployed().then(function(instance) {
            instance.address= "0x09415AE50Deca4E7222954f8dc0ABb3Ef457E816"
            creationInstance = instance;
            return creationInstance.resurrection(App.heroId);
        }).then(function(resurrection) {
            App.render();
        });
    },


    spawn: function() {

        var rand = Math.round(Math.random() * 1);
        App.rand = rand;
        var enemyspot = $("#enemyspot");
        enemyspot.empty();
        App.contracts.Creation.deployed().then(function(instance) {
            instance.address= "0x09415AE50Deca4E7222954f8dc0ABb3Ef457E816"
            creationInstance = instance;
            var anumb = creationInstance.randNum2(2);

            return creationInstance.randNum2(2);
        }).then(function(randNum2) {
            App.randNum2 = randNum2;


            if (App.randNum2 == 1) {
                App.contracts.Creation.deployed().then(function(instance) {
                    instance.address= "0x09415AE50Deca4E7222954f8dc0ABb3Ef457E816"
                    creationInstance = instance;
                    return creationInstance.enemyScrab(App.heroes[2]);
                }).then(function(enemyScrab) {

                    return creationInstance.getmonstersByOwner(App.account);
                }).then(function(getmonstersByOwner) {

                    App.monsterId = getmonstersByOwner;

                    return creationInstance.enemies(getmonstersByOwner)
                }).then(function(enemies) {

                    App.enemies.push(enemies);
                    App.enemies[App.monsterId] = enemies;
                    var name = enemies[0];
                    var life = enemies[1];
                    var lvl = enemies[2];
                    var xp = enemies[3];
                    var atk = enemies[4];

                    var enemyTemplate = "<tr ><td colspan='2'><img src = './images/" + App.randNum2 + ".jpg' width ='200px'></td></tr><tr><td> Name</td><td>: " + name + "</td></tr><tr><td>Health Points</td><td>: " + life + " HP</td></tr><tr><td>Level</td><td>: " + lvl + "</td></tr><tr><td>Experiance</td><td>: " + xp + "</td></tr><tr><td>Attack</td><td>: " + atk;
                    enemyspot.append(enemyTemplate);
                    isCreated = 1;
                });
            } else {
                App.contracts.Creation.deployed().then(function(instance) {
                    instance.address= "0x09415AE50Deca4E7222954f8dc0ABb3Ef457E816"
                    creationInstance = instance;
                    return creationInstance.enemyBcrab(App.heroes[2]);
                }).then(function(enemyBcrab) {

                    return creationInstance.getmonstersByOwner(App.account);
                }).then(function(getmonstersByOwner) {

                    App.monsterId = getmonstersByOwner;
                    return creationInstance.enemies(getmonstersByOwner)
                }).then(function(enemies) {

                    App.enemies.push(enemies);
                    App.enemies[App.monsterId] = enemies;
                    var name = enemies[0];
                    var life = enemies[1];
                    var lvl = enemies[2];
                    var xp = enemies[3];
                    var atk = enemies[4];

                    var enemyTemplate = "<tr ><td colspan='2'><img src = './images/" + App.randNum2 + ".jpg' width ='200px'></td></tr><tr><td> Name</td><td>: " + name + "</td></tr><tr><td>Health Points</td><td>: " + life + " HP</td></tr><tr><td>Level</td><td>: " + lvl + "</td></tr><tr><td>Experiance</td><td>: " + xp + "</td></tr><tr><td>Attack</td><td>: " + atk;
                    enemyspot.append(enemyTemplate);
                    isCreated = 1;
                });
            }
        });

    },

    validate: function() {
        var name = document.getElementById("name").value;

        App.contracts.Creation.deployed().then(function(instance) {
instance.address= "0x09415AE50Deca4E7222954f8dc0ABb3Ef457E816"
            return instance.createhero(name, {
                from: App.account
            });
        }).then(function(result) {
            App.render();
            $("#adventure").show();
            App.actions.unshift("Your here has been created");
            App.actionRender();
        });
    },
    loadMonsters: function() {
        App.contracts.Creation.deployed().then(function(instance) {
            instance.address= "0x09415AE50Deca4E7222954f8dc0ABb3Ef457E816"
            creationInstance = instance;
            return creationInstance.monsterCount();
        }).then(function(monsterCount) {

            for (var i = 0; i < monsterCount; i++) {

                creationInstance.enemies(i).then(function(enemies) {
                    App.enemies.push(enemies);

                });
            }
        })
    },
    actionRender: function() {

        var act1 = $("#first");
        var act2 = $("#second");
        var act3 = $("#third");
        var act4 = $("#forth");
        var act5 = $("#fifth");
        var act6 = $("#sixth");
        act1.empty();
        act2.empty();
        act3.empty();
        act4.empty();
        act5.empty();
        act6.empty();
        act1.append(App.actions[0]);
        act2.append(App.actions[1]);
        act3.append(App.actions[2]);
        act4.append(App.actions[3]);
        act5.append(App.actions[4]);
        act6.append(App.actions[5]);
    }
};
var started = 0;
var enemyspot = $("#enemyspot");
let startFlag;
var account;
setInterval(async function() {
    try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0 && accounts[0] !== account) {
            account = accounts[0];
            App.render(); // Ενημέρωσε τα στοιχεία της σελίδας
            App.showsell(); // Ενημέρωσε τα στοιχεία της σελίδας
            // Αφαίρεσε το location.reload();
        }
    } catch (error) {
        console.error("Error fetching accounts:", error);
    }
}, 100);
 

function startTest() {
    if (App.heroId === null) {
        $("#adventure").hide();
    } else {
        $("#adventure").show();
    };
}

function startAdventure() {
    startFlag = 1;
    $("#adventure").hide();
    var instructions = $("#advWrap");
    var heroT = "<p id='instructions'>Press W to walk <br> Press A to attack <br> Press R to run<p>";
    instructions.append(heroT);


};
let isCreated;


document.onkeyup = function(e) {
    if (e.which == 87 && startFlag == 1) {

        let randomNum = Math.round(Math.random() * 3);

        if (randomNum == 1) {

            if (isCreated == 0 || isCreated == null || isCreated == undefined && App.heroes[1] > 0) {
                App.actions.unshift("You have been ambushed!!!");
                App.actionRender();
                App.spawn();
                isCreated = 1;


            } else if (App.enemies[App.monsterId][1] <= 0 && App.heroes[1] > 0) {

                App.spawn();
                isCreated = 1;
            } else if (isCreated == 1) {
                alert("You must kill this monster first")
            }
        } else if (randomNum !== 1 && isCreated !== 1) {
            App.actions.unshift("You didn't encounter any monster");
            App.actionRender();
        } else if (isCreated == 1) {
            alert("You must kill this monster first")
        }
    }
    if (e.which == 65 && isCreated == 1 && App.enemies[App.monsterId][1] > 0 && App.heroes[1] > 0) {


        App.fight()
    }
    if (e.which == 82 && isCreated == 1) {
        App.rand2 = Math.round(Math.random() * 1);
        if (App.rand2 == 0) {
            App.actions.unshift("You have escaped!");
            App.actionRender();
            isCreated = 0;
            enemyspot.empty();
            App.rand2 = 1;
        } else if (App.rand2 == 1) {
            App.actions.unshift("Your escape attempt has failed!");
            App.actionRender();
            App.fight();
        }
    }
};

$(function() {
    $(window).load(function() {
        startTest();
        App.init();
    });
});
window.addEventListener('load', async () => {
    if (window.ethereum) {
        window.web3 = new Web3(ethereum);
        try {
            await ethereum.enable();
        } catch (error) {
            console.error("User denied account access");
        }
    } else if (window.web3) {
        window.web3 = new Web3(web3.currentProvider);
    } else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }

    await App.init(); // Αρχικοποίησε την εφαρμογή
});