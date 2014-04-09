////////////////////////////////////////////////////////////////////////////////
//	名称: JS 常用工具
//	版本: 1.0
//	作者: 王文 wangwen1220@139.com
//	说明: 需 jQuery 1.7.2 及以上版本支持
//	更新: 2012-10-29 添加：JS 常用变量；JS 常用函数；jQuery 常用插件
////////////////////////////////////////////////////////////////////////////////

/*====================JS 常用变量=====================*/
// IE 版本判断
var isIE = !!window.ActiveXObject,
	isIE6 = isIE && !window.XMLHttpRequest,
	isIE8 = isIE && !!document.documentMode && (document.documentMode == 8),
	//isIE8 = isIE && !!document.documentMode,
	isIE7 = isIE && !isIE6 && !isIE8;

/*====================JS 常用函数=====================*/
// Firebug 提示信息
function log(msg) {window.console && console.log(msg)}

// 检测文字是否为中文
var isChinese = function(word) {return /[\u4E00-\uFA29]+|[\uE7C7-\uE7F3]+/.test(word)};

/*====================jQuery 常用插件=====================*/
(function($){
	// 常用工具
	$.extend({
		// 当前页加入收藏夹
		addFav: function() {
			if (document.all) {
				window.external.addFavorite(window.location.href, document.title);
			} else if (window.sidebar) {
				window.sidebar.addPanel(document.title, window.location.href, "");
			} else {
				alert("加入收藏失败，请手动添加！");
			}
		},
		// 当前页设为首页
		setHome: function() {
			if (document.all) {
				document.body.style.behavior = 'url(#default#homepage)';
				document.body.setHomePage(window.location.href);
			} else {
				alert("此设置只支持 IE 浏览器，其它浏览器请手动设置！");
			}
		}
	});

	// 常用方法
	$.fn.extend({// 要放在全局变量下面，因为有用到其中的变量
		// 最大宽度
		maxWidth: function(value){
			if(!value){
				return this.css('max-width');
			}else{
				return this.each(function(){
					this.style.width = (this.clientWidth > value - 1) ? value + 'px' : 'auto';
				});
			}
		},
		// 最小宽度
		minWidth: function(value){
			if(!value){
				return this.css('min-width');
			}else{
				return this.each(function(){
					this.style.width = (this.clientWidth < value) ? value + "px" : "auto";
				});
			}
		},
		// 最大高度
		maxHeight: function(value){
			if(!value){
				return this.css('max-height');
			}else{
				return this.each(function(){
					this.style.height = (this.scrollHeight > value - 1) ? value + "px" : "auto";
				});
			}
		},
		shareTo: function(options){// 分享到
			if(typeof options == 'string'){// 如果传的参数是字符串
				options = {site: options};
			}
			options = $.extend({
				site: 'tsina',
				content: this.attr('data-cnt'),
				url: window.location
			}, options);
			//site = site || 'tsina';
			//url = url || window.location;
			var site = options.site,
				content = options.content,
				url = options.url;
			content = content.replace(/\s+/g, " ");
			if(content.length > 88){
				content = content.substr(0, 88) + '...';
			}
			//share_content += '\n(>>' + url + ' )';
			if(site === 'tsina'){// 新浪微博
				var share_url = 'http://v.t.sina.com.cn/share/share.php?title=' + encodeURIComponent(share_content) + '&appkey=1452916768&ralateUid=1642635773'
				window.open(share_url);
			}else if(site === 'tqq'){// 腾讯微博
				var _url = "";
				//var _assname = encodeURI("30818627");//你注册的帐号，不是昵称
				//var _appkey = encodeURI("801137460");//你从腾讯获得的appkey
				var _pic = encodeURI('');//（例如：var _pic='图片url1|图片url2|图片url3....）
				//var _u = 'http://share.v.t.qq.com/index.php?c=share&a=index&url='+_url+'&appkey='+_appkey+'&pic='+_pic+'&assname='+_assname+'&title='+encodeURIComponent(share_content);
				var _u = 'http://share.v.t.qq.com/index.php?c=share&a=index&url='+_url+'&pic='+_pic+'&title='+encodeURIComponent(share_content);
				window.open(_u,'', 'width=700, height=680, top=0, left=0, toolbar=no, menubar=no, scrollbars=no, location=yes, resizable=no, status=no');
			}else if(site === 'renren'){
				share_content += '-分享自@火秀网';
				var share_url = 'http://share.renren.com/share/buttonshare.do?link=' + url + '&title=' + encodeURIComponent(share_content);
				window.open(share_url);
			}
		},
		jtShare: function(options){// 分享到（使用 JiaThis API）
			if(typeof options == 'string'){// 如果传的参数是字符串
				options = {webid: options};
			}
			options = $.extend({
				webid: this.attr('data-i') || 'tsina',
				title: this.attr('data-t') || document.title,
				summary: this.attr('data-s') || $('meta[name="description"]').attr('content'),
				pic: this.attr('data-p') || '',
				url: this.attr('data-u') || window.location.href
			}, options);
			var domain = window.location.protocol + '//' + window.location.hostname,
				webid = options.webid,
				title = options.title,
				summary = options.summary,
				url = options.url,
				pic = options.pic,
				jturl;
			title = '#' + title + '#';
			summary = summary.replace(/\s+/g, " ");
			if(summary.length > 88){
				summary = summary.substr(0, 88) + '...';
			}
			summary += '（分享自 @火秀社区） >> ';
			if(url.indexOf('http') != 0){url = domain + url;} // 转为绝对路径
			switch(webid){
				case 'tsina': // 新浪微博
					jturl = 'http://www.jiathis.com/send/?webid=tsina&url=' + encodeURIComponent(url) + '&title=' + encodeURIComponent(title) + '&summary=' + encodeURIComponent(summary);
					if(pic){
						if(pic.indexOf('http') != 0){pic = pic.indexOf('/') != 0 ? domain + '/' + pic : domain + pic;} // 转为绝对路径
						jturl += '&pic=' + encodeURIComponent(pic);
					}
					window.open(jturl);
					break;
				case 'tqq': // 腾讯微博
					jturl = 'http://www.jiathis.com/send/?webid=tqq&url=' + encodeURIComponent(url) + '&title=' + encodeURIComponent(title) + '&summary=' + encodeURIComponent(summary);
					if(pic){
						if(pic.indexOf('http') != 0){pic = pic.indexOf('/') != 0 ? domain + '/' + pic : domain + pic;} // 转为绝对路径
						jturl += '&pic=' + encodeURIComponent(pic);
					}
					window.open(jturl);
					break;
				case 'renren': // 人人网
					jturl = 'http://www.jiathis.com/send/?webid=renren&url=' + encodeURIComponent(url) + '&title=' + encodeURIComponent(title) + '&summary=' + encodeURIComponent(summary);
					if(pic){
						if(pic.indexOf('http') != 0){pic = pic.indexOf('/') != 0 ? domain + '/' + pic : domain + pic;}
						jturl += '&pic=' + encodeURIComponent(pic);
					}
					window.open(jturl);
					break;
				case 'qzone': // QQ空间
					jturl = 'http://www.jiathis.com/send/?webid=qzone&url=' + encodeURIComponent(url) + '&title=' + encodeURIComponent(title) + '&summary=' + encodeURIComponent(summary);
					if(pic){
						if(pic.indexOf('http') != 0){pic = pic.indexOf('/') != 0 ? domain + '/' + pic : domain + pic;}
						jturl += '&pic=' + encodeURIComponent(pic);
					}
					window.open(jturl);
					break;
				case 'douban': // 豆瓣
					jturl = 'http://www.jiathis.com/send/?webid=douban&url=' + encodeURIComponent(url) + '&title=' + encodeURIComponent(title) + '&summary=' + encodeURIComponent(summary);
					if(pic){
						if(pic.indexOf('http') != 0){pic = pic.indexOf('/') != 0 ? domain + '/' + pic : domain + pic;}
						jturl += '&pic=' + encodeURIComponent(pic);
					}
					window.open(jturl);
					break;
			}
		}
	});

	/*!
	 * jQuery 页面滚动浮动层智能定位插件
	 * smartFloat 1.0
	 * Date: 2012-10-27
	 * © 2009-2011 Steven, http://www.seosteven.com/
	 *
	 * This is licensed under the GNU LGPL, version 2.1 or later.
	 * For details, see: http://creativecommons.org/licenses/LGPL/2.1/
	 *
	 * 2010-12-06 v1.0.0 看了张鑫旭的浮动层智能定位例子，有了想改成插件的冲动，于是就有了此插件
	 * 说明：需要注意的一点，导航的宽度必须是固定值，不能是 auto 或者 100% 因为 fixed 和 absolute 都不认识
	 * 当然你也可以手动获取到导航的宽度，然后写到浮动导航样式里
	 * 不过有个前提，导航原先样式里不能有 position:relative，情况可能比较多，最简单的方法还是 把导航宽度定死。
	 */
	$.fn.smartFloat = function(config) {
		return this.each(function() {
			var $this = $(this),
				// 距离屏幕顶部和左侧的距离
				offset_top = $this.offset().top,
				offset_left = $this.offset().left,
				// 默认样式记录，还原初始样式时候需要
				default_position = $this.css('position'),
				default_top = $this.css('top'),
				default_left = $this.css('left'),
				default_zindex = $this.css('z-index'),
				default_width = $this.css('width');

			// 默认设置
			config = $.extend({
				top: 0,
				left: offset_left,
				zindex: 99999,
				width: default_width,
				holder: false// 若浮动元素为静态流元素，需添加占位元素，默不添加
			}, config || {});
			var top = config.top,
				left = config.left,
				zindex = config.zindex,
				width = config.width,
				holder = config.holder;

			// 设置占位元素
			if(holder) {
				var $holder = $('<div class="smart-float-holder" />').insertAfter($this);
				$holder.width($this.outerWidth(true)).height($this.outerHeight(true)).hide();
			}

			//鼠标滚动事件
			$(window).scroll(function() {
				var scroll_top = $(this).scrollTop();
				if(scroll_top > offset_top) {
					// 显示占位元素
					if(holder) $holder.show();

					// 添加类来控制一些复杂的布局
					$this.addClass('smart-float');
					if(window.XMLHttpRequest) {// for !IE6
						$this.css({
							'position': 'fixed',
							'top': top,
							'left': left,
							'z-index': zindex,
							'width': width
						});
					} else {// only for IE6
						// IE6 不认识 position: fixed，单独用 position: absolute 模拟
						$this.css({
							'position': 'absolute',
							'top': scroll_top,
							'left': default_left,
							'z-index': zindex,
							'width': width
						});
						// 防止出现抖动 - 请慎用，会替换 html 已定义的背景图
						$("html").css({'background-image': 'url(about:blank)', 'background-attachment': 'fixed'});
					}
				} else {
					// 隐藏占位元素
					if(holder) $holder.hide();

					// 还原初始样式
					$this.removeClass('smart-float').css({
						'position': default_position,
						'top': default_top,
						'left': default_left,
						'z-index': default_zindex,
						'width': default_width
					});
				}
			});
		});
	};
})(jQuery);