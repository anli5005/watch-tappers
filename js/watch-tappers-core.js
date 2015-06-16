this.WatchTappers = {
	game: {
		tapsRaw: [0], // 1000^0 is the first entry, 1000^1 is the next, 1000^2 is after that, and so on...
		tappers: {},
		watch: {
			id: "test-watch-1",
			upgrade: 0
		}
	},
	
	upgrades: {
		watches: {
			"test-watch-1": {
				name: "Test watch 1",
				priority: 0,
				price: {taps: 1, powerOf: 0},
				perTap: {taps: 1, powerOf: 0},
				offline: {prod: 1.0, hours: 1},
				faces: ["test-watch-face"],
				upgrades: []
			},
			"test-watch-2": {
				name: "Test watch 2",
				priority: 0,
				price: {taps: 1, powerOf: 1},
				perTap: {taps: 500, powerOf: 0},
				offline: {prod: 1.0, hours: 1},
				faces: ["test-watch-face"],
				upgrades: [{
					price: {taps: 1500, powerOf: 0},
					perTap: {taps: 1, powerOf: 1}
				}
				]
			}
		},
		tappers: {
			"test-tapper-1": {
				name: "Test tapper 1",
				priority: 0,
				price: {taps: 1, powerOf: 0},
				perSecond: {taps: 1, powerOf: 0}
			},
			"test-tapper-2": {
				name: "Test tapper 2",
				priority: 0,
				price: {taps: 1, powerOf: 1},
				perSecond: {taps: 1, powerOf: 1}
			},
			"useless-tapper": {
				name: "USELESS TAPPER",
				priority: 1,
				price: {taps: 0, powerOf: 0},
				perSecond: {taps: 0, powerOf: 0}
			}
		}
	},
	
	__proto__: {
		// Add methods here
		
		// TAP MANAGEMENT
		// These methods manage the management of the taps.
		
		refreshRawTaps: function() { // Checks the raw taps for overflow
			for (var i = 0; i < this.game.tapsRaw.length; i++) {
				if (this.game.tapsRaw[i] >= 1000) {
					var thousands = Math.floor(this.game.tapsRaw[i] / 1000);
					this.game.tapsRaw[i] -= thousands * 1000;
					if (i >= this.game.tapsRaw.length - 1) {
						this.game.tapsRaw.push(thousands);
					} else {
						this.game.tapsRaw[i + 1] += thousands;
					}
				} else if (this.game.tapsRaw[i] < 0) {
					if (i + 1 < this.game.tapsRaw.length) {
						this.game.tapsRaw[i + 1] -= 1;
						this.game.tapsRaw[i] += 1000;
					}
				}
			}
		},
		
		addTaps: function(taps, powerOf) { // Adds taps to the raw taps
			if (taps == 0 || powerOf < 0) {
				return;
			}
			
			if (powerOf >= this.game.tapsRaw.length) {
				for (var i = this.game.tapsRaw.length; i <= powerOf; i++) {
					this.game.tapsRaw[i] = 0;
				}
			}
			
			this.game.tapsRaw[powerOf] += taps;
			
			this.refreshRawTaps();
		},
		
		tapsLessThan: function(taps, powerOf) {
			this.refreshRawTaps();
			for (var i = powerOf + 1; i < this.game.tapsRaw.length; i++) {
				if (this.game.tapsRaw[i] > 0) {
					return false;
				}
			}
			
			return (this.game.tapsRaw[powerOf] < taps || powerOf > this.game.tapsRaw.length - 1);
		},
		
		// TAPPER HANDLING
		// Handles tappers and their functionality
		
		tapperCount: function(id) {
			if (typeof this.game.tappers[id] == "undefined") {
				return 0;
			} else {
				return this.game.tappers[id];
			}
		},
		
		addTapper: function(id, amount) {
			var tappersToAdd = typeof amount == "undefined" ? 1 : amount;
			this.game.tappers[id] = this.tapperCount(id) + tappersToAdd;
		},
		
		tapsPerSecond: function() {
			var generation = {};
			for (var tapperId in this.game.tappers) {
				if (this.game.tappers.hasOwnProperty(tapperId)) {
					if (this.game.tappers[tapperId] <= 0) {
						continue;
					}
					var tapperTPS = this.upgrades.tappers[tapperId].perSecond;
					var taps = tapperTPS.taps * this.game.tappers[tapperId];
					generation[tapperTPS.powerOf] = generation.hasOwnProperty(tapperTPS.powerOf) ? generation[tapperTPS.powerOf] + taps : taps;
				}
			}
			
			var objectKeys = Object.keys(generation);
			if (objectKeys.length <= 0) {
				return {taps: 0, powerOf: 0};
			}
			var powersToInclude = [Math.max.apply(null, objectKeys)];
			if (objectKeys.indexOf((powersToInclude[0] - 1).toString()) >= 0) {
				powersToInclude.push(powersToInclude[0] - 1);
				return {
					taps: generation[powersToInclude[1]] + (generation[powersToInclude[0]] * 1000),
					powerOf: powersToInclude[1]
				};
			} else {
				return {taps: generation[powersToInclude[0]], powerOf: powersToInclude[0]};
			}
		},
		
		addTapsPerSecond: function() {
			var TPS = this.tapsPerSecond();
			this.addTaps(TPS.taps, TPS.powerOf);
		},
		
		startTapperCycle: function() {
			return window.setInterval(function(t) {
				t.addTapsPerSecond.call(t);
			}, 1000, this);
		},
		
		// WATCH HANDLING
		// Controls watches and processes the user's taps.
		
		setWatch: function(watch, upgrade) {
			this.game.watch = {
				id: watch,
				upgrade: upgrade
			};
		},
		
		tap: function(multiplier) {
			var x = typeof multiplier == "undefined" ? 1 : multiplier;
			
			var watchUpgrade = (this.game.watch.upgrade <= 0) ? this.upgrades.watches[this.game.watch.id] : this.upgrades.watches[this.game.watch.id].upgrades[this.game.watch.upgrade - 1];
			var tapsPerTap = watchUpgrade.perTap;
			
			this.addTaps(tapsPerTap.taps * x, tapsPerTap.powerOf);
		},
		
		// UPGRADE PURCHASING
		// Purchases upgrades.
		
		upgradesAvailable: function(type) {
			var upgrades = (type == "watch") ? this.upgrades.watches : this.upgrades.tappers;
			
			var priorities = {};
			
			for (var upgrade in upgrades) {
				if (upgrades.hasOwnProperty(upgrade)) {
					if (!priorities.hasOwnProperty(upgrades[upgrade].priority)) {
						priorities[upgrades[upgrade].priority] = [];
					}
					priorities[upgrades[upgrade].priority].push(upgrade);
				}
			}
			
			for (var priority in priorities) {
				if (priorities.hasOwnProperty(priority)) {
					priorities[priority].sort(function(a, b) {
						var perA = (type == "watch") ? upgrades[a].perTap : upgrades[a].perSecond;
						var perB = (type == "watch") ? upgrades[b].perTap : upgrades[b].perSecond;
						
						if (perA.powerOf != perB.powerOf) {
							return (perA.powerOf < perB.powerOf) ? -1 : 1;
						} else {
							return (perA.taps < perB.taps) ? -1 : 1;
						}
					});
				}
			}
			
			var available = [];
			var p = Object.keys(priorities);
			p.sort(function(a, b) {
				return b - a;
			});
			
			for (var i = 0; i < p.length; i++) {
				available = available.concat(priorities[p[i]]);
			}
			
			return available;
		},
		
		tapperPrice: function(id) {
			var purchasePrice = this.upgrades.tappers[id].price;
			var tapsNeeded = purchasePrice.taps * (1 + (this.tapperCount(id) / 10));
			
			return {
				taps: Math.round(tapsNeeded),
				powerOf: purchasePrice.powerOf
			};
		},
		
		purchaseTapper: function(id) {
			var purchasePrice = this.tapperPrice(id);
			
			if (!this.tapsLessThan(purchasePrice.taps, purchasePrice.powerOf)) {
				this.addTaps(purchasePrice.taps * -1, purchasePrice.powerOf);
				this.addTapper(id, 1);
			}
		},
		
		nextWatch: function() {
			var watchId = this.game.watch.id;
			var watchUpgrade = this.game.watch.upgrade;
			
			var maxUpgrade = this.upgrades.watches[watchId].upgrades.length;
			if (watchUpgrade < maxUpgrade) {
				return {
					status: 0, // Status 0 indicates that the watch should be upgraded
					id: watchId,
					upgrade: watchUpgrade + 1
				};
			} else {
				var watches = this.upgradesAvailable("watch");
				var watchIndex = watches.indexOf(watchId);
				if (watchIndex < 0) {
					return {status: 3}; // Status 3 indicates that the argument is invalid (highly unlikely) or that something else went wrong
				} else if (watchIndex + 1 >= watches.length) {
					return {status: 2}; // Status 2 indicates that the watch is at its max
				} else {
					return {
						status: 1, // Status 1 indicates that the watch should be replaced
						id: watches[watchIndex + 1],
						upgrade: 0
					};
				}
			}
		},
		
		upgradeWatch: function() {
			var nextUpgrade = this.nextWatch();
			if (nextUpgrade.status < 0 || nextUpgrade.status > 1) {
				return false;
			}
			
			var watchObject = this.upgrades.watches[nextUpgrade.id];
			if (nextUpgrade.status == 0) {
				watchObject = watchObject.upgrades[nextUpgrade.upgrade - 1];
			}
			
			var price = watchObject.price;
			if (!this.tapsLessThan(price.taps, price.powerOf)) {
				this.addTaps(price.taps * -1, price.powerOf);
				this.setWatch(nextUpgrade.id, nextUpgrade.upgrade);
			}
			
			return !this.tapsLessThan(price.taps, price.powerOf);
		}
	}
};