this.WatchTappersUI = {
	currentFace: "cheapest-watch-face1",
	is24Hours: false,
	
	__proto__: {
		
		loadWatchClasses: function() {
			var watchId = WatchTappers.game.watch;
			
			$(".watch").attr("class", "watch watch-" + watchId.id);
			$(".watch-face").attr("class", "watch-face watch-face-" + this.currentFace);
		},
		
		load24HourClasses: function() {
			if (this.is24Hours) {
				$(".watch-face-digital").addClass("watch-face-24hours");
			} else {
				$(".watch-face-digital").removeClass("watch-face-24hours");
			}
		},
		
		tapperCallback: function() {
			
		},
		
		updateWatchFace: function() {
			var date = new Date();
			
			if ($(".watch-face-digital").css("display") != "none") {
				
				$(".watch-minute").text((date.getMinutes() < 10 ? "0" : "") + date.getMinutes().toString());
				$(".watch-second").text((date.getSeconds() < 10 ? "0" : "") + date.getSeconds().toString());
				
				var hour = date.getHours();
				if (!this.is24Hours) {
					$(".watch-12hour").text(hour < 13 ? "AM" : "PM");
					hour -= ((hour < 13) ? 0 : 12);
				}
				
				$(".watch-hour").text(hour);
				
			} else if ($(".watch-face-analog").css("display") != "none") {
				
			} else if ($(".watch-face-custom").css("display") != "none") {
				
			}
		},
		
		start: function() {
			this.loadWatchClasses();
			WatchTappers.startTapperCycle(this.tapperCallback);
			this.updateWatchFace();
			window.setInterval(function(t) {
				t.updateWatchFace.call(t);
			}, 1000, this);
		},
		
		run: function(instances) {
			var $            = instances.jQuery;
			var WatchTappers = instances.core;
			
			this.start();
		}
		
	}
};
