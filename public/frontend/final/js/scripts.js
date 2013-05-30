var _b = $("body")
	, _w = $(window)
	, _d = $(document)


var smallGallery = (function() {

	var galleryItem = $('.smallGallery a')
	, galleryCaption = $('.smallGallery .caption')
	, galleryWidth = galleryItem.find('img').css('width')
	, captionText = galleryItem.first().find('img').attr('rel')
	, captionContainer = $('.smallGallery .content')
	, current = $('.smallGallery a.show')
	, btnNext = $('.next')
	, btnPrev = $('.previous')
	, timeoutGallery = 0
	, disableButton = false
	, options = {
		transitionTime : 500
		, intervalTime : 4000
	}

	, _init = function() {
		galleryItem.css({opacity:0.0});
		galleryItem.first().css({opacity:1.0});
		galleryCaption.css({opacity:1.0});
		captionContainer.html(captionText).animate({opacity:1.0});

		_bindEvents();
		_startInterval();
	}

	, _gallery = function(next) {

		if(next) {
			if($(current.next().length)) {
					if (current.next().hasClass('caption')) {
						currentElement = $('.smallGallery a:first');
					} else {
						currentElement = current.next();
					}
				} else {
					currentElement = $('.smallGallery a:first');
			}
		} else {
			if (current.prev().length==0) {
				currentElement = $('.smallGallery a:last');
			} else {
				currentElement = current.prev();
			}

		}

		var caption = currentElement.find('img').attr('rel')
		, galleryCaption = $('.smallGallery .caption')
		, galleryContent = $('.smallGallery .content');

		disableButton = true;
		currentElement.css({opacity: 0.0})
			.addClass('show')
			.animate({opacity:1.0}, options.transitionTime);

		current.animate({opacity: 0.0}, options.transitionTime, function(){disableButton = false})
			.removeClass('show');

		galleryCaption.animate({opacity: 0.0}, function(){galleryContent.html(caption);
			$(this).animate({opacity: 1.0})
		});

		current = currentElement;
	}

	, _move = function(next) {
		if(!disableButton) {
			clearTimeout(timeoutGallery);
			_gallery(next);
			_startInterval();
		}
	}

	, _startInterval = function() {
		timeoutGallery = setInterval(function(){_gallery(true)}, options.intervalTime);
	}

	, _bindEvents = function() {
		btnNext.click(function(){
			_move(true);
		});

		btnPrev.click(function(){
			_move(false);
		});
	}
	_init();
})();

var HashController = (function(){
	var _hash = ""
		, _normalized = ""
		, _sections = _b.find("#content div.screens")
		, _availableHashs = [""]
		, _changeHash = function( scrollTop ){
			var hash = "";

			_sections.each( function( i, obj ){ //Percorre todas as tags Section da pagina
				var section = $(obj)
					, id = section.attr("id")
					, diff = 160

				//if (section.offset().top - diff <= scrollTop & id=='eletric-map' & hash!='eletric-map'){diff = 360; scrollTop = scrollTop-diff}	
					
				if ( section.offset().top - diff <= scrollTop ){ // Verifica se o Section atual tem o Offset menor ou igual ao Scroll top da Janela
					hash = id;
					//console.log(hash + 'ssss' + section.index() + 'ssss' + diff)
				}
			});
		//	
			HashController.setHash(hash);

			return;
		}
	return {
		init : function(){
			_sections.each( function( i, obj ){ //Percorre todas as tags Section da pagina
				var section = $(obj)
					, id = section.attr("id")

				_availableHashs.push(id);

			});
			_hash = window.location.hash == "#_=_" ? "#!eletric-map" : window.location.hash;
			_normalized = _hash.replace("#!","");

			if(_normalized != ""){
				_b.animate({ scrollTop : _b.find("#"+_normalized).offset().top },'fast');
				Loader.hide();
			}
		}
		, hasHash : function(){
			return _normalized != "";
		}
		, getHash : function(){
			return _normalized;
		}
		, changeHash : function( scrollTop ){
			return _changeHash( scrollTop );
		}
		, setHash : function(hash){
			if( hash != _hash && !!(~_availableHashs.indexOf(hash)) ){
				_normalized = hash;
				_hash = "#!"+_normalized;
				window.location.hash = _hash

				if(_normalized != "")
					_b.removeClass().addClass(_normalized+"-panel");
				else
					_b.removeClass();
			}
		}
	}
})()

var Loader = (function(){
	var _button = _b.find('#goSuck')
	, _loader = _b.find('#loader')
	, _letter = _b.find('.switchLetter')
	, _canPress = false
	, _hide = function(){
		_loader.animate({ "bottom" : _loader.height(), "top" : -_loader.height() },function(){
			_b.removeClass('loading hide-scroll');
			if(!HashController.hasHash()){
				Scroller.straw.on('animationend webkitAnimationEnd oAnimationEnd oAnimationEnd MSAnimationEnd',
				function() {
					Scroller.straw.removeClass("start-animation")
				}).addClass("start-animation");
			}
			_loader.remove();
			_button.off("click.GoShow");
		});
	}
	, _init = function() {
		_button.on("click.GoShow",function() {
			if(_canPress){
				_hide();
			}
		});
		_button.hover(
			function () {
				_loader.addClass("suck");
			},
			function () {
				_loader.removeClass("suck");
			});
	}
	_init();
	return {
		button: {
			enable : function(){
				_canPress = true;
			},
			disable : function(){
				_canPress = false;
			}
		},
		hide: _hide
	}
})();


var Scroller = (function(){
	var _straw = _b.find("#canudo")
		, _init = function() {
			_w.bind("scroll",function(e){
				var scrollTop = _w.scrollTop()
					, marginTop = scrollTop - (parseInt(600 + (_d.height() - _straw.height() - 600 - 1000)*(scrollTop-600)/(_d.height()-600-1300)) )

				HashController.changeHash( scrollTop );

				if(marginTop >= 0){
					if(marginTop < 900 ){

						_straw.css({ "top" : "" });
						_straw.removeClass("bottom").addClass("fixed");
						_straw.css({ "margin-top" : -1*marginTop });

					} else {

						_straw.removeClass("fixed")
						_straw.css({ "margin-top" : "" });
						_straw.css({ "top" : (_d.height() - (_straw.height()+1300)) });

					}

				} else {
					_straw.css({ "margin-top" : 0 });
					_straw.removeClass("bottom fixed");
				}
			});

		}
	_init();
	return {
		straw: _straw
	}
})()

HashController.init();

$(window).load(function(){
	_b.removeClass("loading");
	Loader.button.enable();
})

$(function(){
	$(".mask").each(function(i, obj){
		var mask = $(obj).attr("mask");
		$(obj).mask(mask);
	})
	$('.flexslider').flexslider({
		animation: "slide",
		slideshow: "false",
		prevText: "‹",
		nextText: "›"
	});
})


