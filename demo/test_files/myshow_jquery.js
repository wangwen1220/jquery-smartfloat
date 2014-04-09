(function($){
	$(function(){
		/*====================我秀变量=====================*/
		var $body = $('body'),
			$loginbar = $('#loginbar'),
			$page_overlay = $('#page-overlay'),
			$login_dialog = $('#login-dialog'),
			$canvas = $('#canvas'),
			$pin = $canvas.find('.pin'),
			$search = $('#search'),
			$search_wd = $('#search-wd'),
			$nav = $('#nav'),
			$menu = $('#menu'),
			user_id = $menu.attr('data-id'),// 用户 ID
			$dilog_close = $('.dialog .close'),
			dialog_url = '/index.php?m=community&c=index&a=myshow_collect_all',
			ALBUM_NAME_LEN = 15;

		/*====================我秀插件=====================*/
		$.fn.extend({// 要放在全局变量下面，因为有用到其中的变量
			// 转藏
			repin: function(){
				this.live('click', function(){
					if(user_id){
						var pinner_id = $(this).parents('.pin').find('.user').attr('data-uid') || $('#pinner').attr('data-id');
						if(user_id == pinner_id) {
							$("<span class='tip-like'></span>").insertAfter(this).css('left', '87px').delay(500).fadeOut(1000, function(){
								$(this).remove();
							});
							return;
						}
						var url = '/index.php?m=community&c=index&a=ajax_transfer',
							share_id = $(this).parents('.pin').attr('data-id') || $(this).parents('#pin-actions').attr('data-id');
						$.get(url, {"share_id": share_id}, function(d){
							$(d).appendTo('body').add($page_overlay).show();
							if(isIE6){
								$('html').css('overflow', 'hidden');
							}else{
								$body.css('overflow', 'hidden');
							}
							//$(window).scrollTop(0);
							initDivselect();
						});
					}else{
						openLoginDialog();
					}
					return false;
				});
				return this;
			}
		});

		/*====================通用动作=====================*/
		// 删除前提示
		$(document).on('click', '.del-tip', function(){
			var url = this.href;
			$.dialog({
				title: '提示信息',
				content: '此操作不可恢复，请谨慎操作！确定删除？',
				icon: 'warning',
				fixed: true,
				okVal: '删除',
				ok: function(){
					window.location = url;
				},
				cancel: true
			});
			return false;
		});

		/*====================我秀首页=====================*/
		// 添加收藏和设为首页
		$('#topbar .help').on('click', 'a', function(){
			if($(this).hasClass('home')){
				$.setHome();
			}else{
				$.addFav();
			}
		});
		// 导航菜单
		var $nav_item_current = $nav.find('.nav-item-current');
		$nav.on('mouseenter', '.nav-item', function(){
				$nav_item_current.removeClass('nav-item-current');
		}).on('mouseleave', function(){
			$nav_item_current.addClass('nav-item-current');
		});

		// 页面滚动浮动导航智能固顶
		$('#header').smartFloat({holder: true});

		/*$nav.on({
			mouseenter: function(){
				$(this).addClass('nav-item-current');
				$nav_item_current.removeClass('nav-item-current');
			},
			mouseleave: function(){
				$(this).removeClass('nav-item-current');
				if(!isIE6) $nav_item_current.addClass('nav-item-current');
			}
		}, '.nav-item');
		$nav.on('mouseleave', function(){
			$nav_item_current.addClass('nav-item-current');
		});*/

		// 用户登录菜单
		$.getJSON($body.attr('data-id'), function(d){
			$("body, #add").addClass('logged');
			$menu.find('.sys-msg a').attr('href', d.sys_msg_url).find('span').html(d.sys_msg_num);
			if(d.sys_msg_num > 0) $menu.find('.sys-msg a span').show();
			//$menu.find('.user-msg a').attr('href', d.user_msg_url).find('span').html(d.user_msg_num);
			if(d.user_msg_num > 0) $menu.find('.user-msg a span').show();
			$menu.find('.nav img').attr('src', d.user_avatar);
			$menu.find('.nav strong').html(d.user_name);
			$menu.find('.logout').attr('href', d.logout_url);
			// 解决 IE 浏览器中的最大宽度问题，IE8 中此最大宽度也有点问题
			if(isIE) $('#menu_user .nav strong').maxWidth(77);
		});

		// 页面搜索
		$search.click(function(){
			$search.addClass('focus');
			$search_wd.focus();
		});
		$search_wd.blur(function(){
			$search.removeClass('focus');
		});
		$('form.search').live('submit', function(){// 头部和购物搜索
			var search_wd = $.trim($('.search-wd',this).val());
			if(!search_wd){
				$.dialog({
					content: '请输入您要搜索的关键词！',
					icon: 'warning',
					follow: this,
					time: 2
				});
				return false;
			}
		});

		// 打开/关闭登录弹窗
		$loginbar.find('.login').click(function(){
			openLoginDialog();
			return false;
		});
		$login_dialog.find('.close').click(function(){
			closeLoginDialog();
			return false;
		});

		// 购物页只显示前15个分类按钮
		$('.cats-list', $canvas).each(function(){
			var $ths_list = $(this);
			if($('li', $ths_list).length > 15){
				$ths_list.children('li:gt(14)').hide().end().append("<li><a class='load-cats' href='javascript:;'>更多</a></li>");
			}
		});

		// 未登录点喜欢、转藏、评论、发私信按钮弹出登录框
		if(!user_id){
			$pin.find('.actions a, .follow-bar a, .action a, .action-btns a').live('click', function(){
				openLoginDialog();
				return false;
			});
			$('#wrapper.fans-page').find('.actions, .action').click(function(){
				openLoginDialog();
				return false;
			});
			$('#js-comment-form').live('submit', function(){// 专辑详细页评论
				openLoginDialog();
				return false;
			});
			$('#js-comment-form, #show-comment-form, #zoomer-comment').on('focusin', 'textarea', function(){// 专辑详细页评论框点击
				openLoginDialog();
				return false;
			});
		}

		// 置顶弹窗
		$canvas.on('click', '.btn-top', function(){
			if($(this).text() === '取消置顶') return;
			var url = this.href;
			$.getScript('/statics/js/artDialog/plugins/iframeTools.js', function(){
				$.dialog.load(url, {
					id: 'set-top-dialog',
					//width: 200,
					title: '置顶',
					ok: function(){
						//var ths = this, form = this.iframe.contentWindow.document.getElementById('artform');
						var ths = this, $form = $('#artform');
						$.post($form.attr('action'), $form.serializeArray(), function(d){
							if(d == 1){
								//ths.title('操作成功').content('置顶操作成功，页面两秒后自动刷新！').time(2);
								// 如果是 iframe 用这种方法窗口能自适应，插件的 BUG
								ths.close();
								$.dialog({
									title: '操作成功',
									content: '置顶操作成功，两秒后自动刷新页面！',
									lock: true,
									background: '#444',
									opacity: 0.8,
									close: function(){
										location.reload();
									},
									time: 2
								});
								//setTimeout(function(){location.reload();}, 2000);
							}else{
								alert('提交出错！');
							}
						});
						return false
					},
					cancel: true
				});
			});
			return false;
		});

		// 添加或取消喜欢
		$pin.find('.actions .like').live('click', function(){
			var pinner_id = $(this).parents('.pin').find('.user').attr('data-uid');
			if(!user_id){
				openLoginDialog();
				return;
			}
			if(user_id == pinner_id) {
				$("<span class='tip-like'></span>").insertAfter(this).delay(500).fadeOut(1000, function(){$(this).remove();});
				return;
			}
			var $ths = $(this),
				url = '/index.php?m=community&c=myhuoshow&a=mylikeshare',
				shareid = $ths.parents('.pin').attr('data-id'),
				$ths_text = $ths.find('span'),
				$ths_num = $ths.find('strong'),
				like_num = parseInt($ths_num.text());
			if($ths_text.text() == '喜欢'){
				$.get(url, {"shareid": shareid}, function(d){
					if(d == 1){
						$ths_text.text('取消喜欢');
						$ths_num.text(like_num + 1);
					}else{
						alert('糟糕，出错了！');
					}
				});
			}else{
				$.get(url, {"shareid": shareid, "list": "2"}, function(d){
					if(d == 1){
						$ths_text.text('喜欢');
						$ths_num.text(like_num - 1);
					}else{
						alert('糟糕，出错了！');
					}
				});
			}
		});

		// 分享详细页添加或取消喜欢
		$('#pin-actions .like a').click(function(){
			var pinner_id = $('#pinner').attr('data-id');
			if(!user_id){
				openLoginDialog();
				return false;
			}
			if(user_id == pinner_id) {
				$("<span class='tip-like'></span>").insertAfter(this).delay(500).fadeOut(1000, function(){$(this).remove();});
				return;
			}
			var $ths = $(this),
				url = '/index.php?m=community&c=myhuoshow&a=mylikeshare',
				shareid = $ths.parents('#pin-actions').attr('data-id'),
				$ths_text = $ths.find('strong');
				//$ths_num = $ths.find('span'),
				//like_num = parseInt($ths_num.text());
			if($ths_text.text() == '喜欢'){
				$.get(url, {"shareid": shareid}, function(d){
					if(d == 1){
						$ths_text.text('取消喜欢');
						//$ths_num.text(like_num + 1);
					}else{
						alert('糟糕，出错了！');
					}
				});
			}else{
				$.get(url, {"shareid": shareid, "list": "2"}, function(d){
					if(d == 1){
						$ths_text.text('喜欢');
						//$ths_num.text(like_num - 1);
					}else{
						alert('糟糕，出错了！');
					}
				});
			}
		});
		// 分享详细页，删除分享
		/*$('#pin-actions .del a').click(function(){
			var url = this.href;
			$.dialog({
				title: '提示信息',
				content: '此操作不可恢复，请谨慎操作！确定删除？',
				icon: 'warning',
				okVal: '删除',
				ok: function(){
					window.location = url;
				},
				cancel: true
			});
			return false;
		});*/

		// 粉丝和关注用户页，关注用户 & 达人页
		$('#wrapper.fans-page .follow-user, #wrapper.daren .follow-user').live('click', function(){
			if(!user_id){
				openLoginDialog();
				return false;
			}
			var $ths = $(this),
				url = '/index.php?m=community&c=myhuoshow&a=myfollowuser',
				pinner_id = $ths.attr('data-uid'),
				$follow_btns = $ths.parents('#wrapper').find('.follow-user[data-uid="'+pinner_id+'"]');// 所有该用户的关注按钮
			if($ths.text() === '关注Ta'){
				$.get(url, {"src_uid": user_id, "dst_uid": pinner_id}, function(d){
					if(d == 1){
						$follow_btns.html('取消关注');
					}else{
						alert('糟糕，出错了！');
					}
				});
			}else{
				$.get(url, {"src_uid": user_id, "dst_uid": pinner_id, "list": 2}, function(d){
					if(d == 1){
						$follow_btns.html('<span>关注Ta</span>');
					}else{
						alert('糟糕，出错了！');
					}
				});
			}
			return false;
		});

		// 关注用户按钮
		$pin.find('a.follow-user').live('click', function(){
			if(!user_id){
				openLoginDialog();
				return false;
			}
			var url = '/index.php?m=community&c=myhuoshow&a=myfollowuser',
				$ths = $(this),
				pinner_id = $ths.attr('data-uid'),
				$follow_btns = $canvas.find('.pin').find('a.follow-user[data-uid="'+pinner_id+'"]');// 所有该用户的关注按钮
			if($ths.text() === '关注Ta'){
				$.get(url, {"src_uid": user_id, "dst_uid": pinner_id}, function(d){
					if(d == 1){
						$follow_btns.addClass('followed').text('取消关注');
					}else{
						alert('糟糕，出错了！');
					}
				});
			}else{
				$.get(url, {"src_uid": user_id, "dst_uid": pinner_id, "list": 2}, function(d){
					if(d == 1){
						$follow_btns.removeClass('followed').text('关注Ta');
					}else{
						alert('糟糕，出错了！');
					}
				});
			}
			return false;
		});

		// 发送私信弹窗
		$('#canvas a.send-msg, #wrapper.fans-page a.send-msg, #wrapper.daren a.send-msg').live('click', function(){
			if(!user_id){
				openLoginDialog();
				return false;
			}
			var url = this.href,
				$ths = $(this),
				pinner_id = $ths.parent().attr('data-uid'),
				$send_msg_form = $('#send-msg-form');
			$.dialog({
				title: "发送私信",
				content: $send_msg_form[0],
				zIndex: 21,
				fixed: true,
				okVal: "发 送",
				ok: function(){
					var ths = this, msg = $.trim($('textarea', $send_msg_form).val());
					if(!msg){
						$.dialog({title: "提示信息", icon: 'warning', content: "请输入私信内容！", time: 2});
						return false;
					}else if(msg.length > 140){
						$.dialog({title: "提示信息", icon: 'warning', content: "私信内容最多为 140 字！", time: 2});
						return false;
					}
					$.post(url, $send_msg_form.serializeArray(), function(d){
						if(d == 1){
							$.dialog({title: "提示信息", icon: 'succeed', content: "发送成功，两秒后窗口自动关闭！", time: 2});
							ths.close();
						}else{
							$.dialog({title: "提示信息", icon: 'error', content: "发送失败，请联系管理员！", time: 2});
						}
					});
					return false;
				},
				close: function(){
					$send_msg_form[0].reset();
				},
				cancel: true
			});
			return false;
		});

		// 转藏弹窗
		$pin.find('.actions .repin').repin();
		$('#pin-actions .repin').repin();
		/*$pin.find('.actions .repin').add('#pin-actions .repin').live('click', function(){
		$('#pin-actions .repin').live('click', function(){
			if(user_id){
				var pinner_id = $(this).parents('.pin').find('.user').attr('data-uid') || $('#pinner').attr('data-id');;
				if(user_id == pinner_id) {
					$("<span class='tip-like'></span>").insertAfter(this).css('left', '87px').delay(500).fadeOut(1000, function(){
						$(this).remove();
					});
					return;
				}
				var url = '/index.php?m=community&c=index&a=ajax_transfer',
					data = 'share_id=' + $(this).parents('.pin').attr('data-id') || $(this).parents('#pin-actions').attr('data-id');
				$.get(url, data, function(d){
					$(d).appendTo('body').add($page_overlay).show();
					$('html').css('overflow', 'hidden');
					//$(window).scrollTop(0);
					initDivselect();
				});
			}else{
				openLoginDialog();
			}
			return false;
		});*/

		// 创建专辑页2，点击空 pin 弹出创建分享弹窗
		$canvas.find('.pin-empty').click(function(){
			var album_id = $canvas.attr('data-id');
			dialog_url += '&album_id=' + album_id;
			openDialog('collect-dialog');
			return false;
		});

		// 采集选择弹窗
		$('#open_scrape_pin').live('click', function(){
			$('#collect-dialog').hide();
			openDialog('collect-all-pin');
			return false;
		});
		$('#open_upload_pin').live('click', function(){
			$('#collect-dialog').hide();
			openDialog('upload-pin-dialog');
			return false;
		});
		$('#open_create_album').live('click', function(){
			$('#collect-dialog').hide();
			openDialog('create-album-dialog', true);
			return false;
		});

		// 举报弹窗
		$('.actions .report').live('click', function(){
			$.get(this.href, function(d){
				$(d).appendTo('body');
				if(isIE6){
					$('html').css('overflow', 'hidden');
					//$('html').css('overflow-x', 'hidden');//todo
				}else{
					$body.css('overflow', 'hidden');
				}
				$page_overlay.show();
			});
			return false;
		});

		// 关闭弹窗-所有弹窗通用
		$dilog_close.live('click', function(){
			var $dialog = $(this).parents('.dialog');
			//$dialog.hide();
			$dialog.remove();
			$page_overlay.hide();
			if(isIE) $page_overlay.removeAttr('style'); // for 操蛋的 IE 不支持 RGBA 颜色
			if(isIE6){
				$('html').css('overflow', 'auto');
				$('html').css('overflow-x', 'hidden');//todo
			}else{
				$body.css('overflow', 'auto');
			}
			$dialog.find('form').each(function(){;// 重置表单
				this.reset();
			}).blur();
		});

		// 导航条上的用户菜单
		$('#menu_user').hover(function(){
			$(this).find('ul').toggle();
		});

		// 导航条上的“+”按钮
		$('#add').click(function(){
			if(user_id){
				openDialog('collect-dialog');
				return false;
			}else{
				openLoginDialog();
			}
		}).filter('.logged').hover(function(){
			$(this).find('.add-list').toggle();
		}).find('a').click(function(){
			var dialog_id = $(this).attr('data-id');
			if(dialog_id == 'create-album-dialog'){
				openDialog(dialog_id, true);
			}else{
				openDialog(dialog_id);
			}
			return false;
		});

		// 当鼠标悬停会员头像时加载会员名片
		$pin.find('.user-photo').live({
			mouseenter: function(){// !!requer 1.4.2+
				var $user_info = $(this).siblings('.user-info');
				var pin_col = $(this).parents('.pin').attr('data-waterfall-col');
				if(pin_col == '3') $user_info.addClass('user-info-right');
				$user_info.show();
				if(isIE6 || isIE7) $('#content').css('z-index', 11);// 修复 IE 操蛋的 z-index Bug
			},
			mouseleave: function(){
				var $user_info = $(this).siblings('.user-info');
				$user_info.hide();
				if(isIE6 || isIE7) $('#content').css('z-index', 1);// 修复 IE 操蛋的 z-index Bug
			}
		});
		$pin.find('.user-info').live({
			mouseenter: function(){// !!requer 1.4.2+
				$(this).show();
			},
			mouseleave: function(){
				$(this).hide();
			}
		});

		// 采集弹窗图片、视频、商品采集标签切换
		$('#collect-all-pin .title-tab a').live('click', function(){
			var $ths = $(this),
				i = $('#collect-all-pin .title-tab a').index(this);
			$ths.addClass('selected').siblings().removeClass('selected');
			$ths.parents('.header').siblings('.body').addClass('fn-hide').eq(i).removeClass('fn-hide');
		});
		// 采集弹窗提交后跳转到相应弹窗
		$('#collect-all-pin .search-pin-form').live('submit', function(d){
			var $ths = $(this),
				dialog_id = $ths.attr('data-id'),
				search_url = $.trim($ths.find('input.search-pin').val());
			if(!search_url) {// 如果输入为空
				//alert('请输入网址！');
				$ths.find('.label').text('请输入网址！').css('color', '#EA5265');
				return false;
			}
			$ths.parents('.dialog').find('.close').click();// 触发关闭按钮事件
			openDialog(dialog_id, true, function(search_form){
				search_form.find('.search-pin').val(search_url).blur();// 把搜索网址带过去
				search_form.submit();// 触发搜索
			});
			return false;
		});

		// 采集弹窗表单默认值
		$('.fancy').find('input, textarea').live('focus', function(){
			$(this).next('label').hide();
		}).live('blur', function(){
			this.value = $.trim(this.value);
			if(!this.value){
				$(this).next('label').show();
			}else{
				$(this).next('label').hide();
			}
		}).trigger('blur');

		// 采集公开性选择菜单
		$('#menu-openness').live('hover', function(e){
			if(e.type == 'mouseenter'){
				$(this).find('.openness').show();
			}else{
				$(this).find('.openness').hide();
			}
		}).find('.openness li').live('click', function(){
			var $ths = $(this);
			$ths.addClass('selected').siblings().removeClass('selected');
			$('#openness').val($ths.text());
		});

		// 选择专辑时更换常用标签
		$('#pin-info-form .option').live('click', function(){
			var $this = $(this);
			var album_id = $this.attr('selectid');
			var album = $this.text();
			var current_album = $this.parents('.divselect').find('.selected').text();
			if(album == current_album) return;
			//$('#pin-tags-id').val(''); // todo
			$.post('/index.php?m=community&c=index&a=myshow_ajax_album', {'album_id': album_id}, function(d){
				$('#tag-list').html(d);
			});
		});

		// 滚动标签列表
		var tag_list_page = 1;
		$(document).on('click', '.tag-list-nav a', function(){
			var $ths = $(this),
				$tag_list = $ths.parents('.select-tags').find('.tag-list'), // 获取滚动列表
				tag_list_page_count = $tag_list.children('.tag-list-item').length,
				tag_list_slide_width = $tag_list.parent().width(), // 获取滚动的宽度
				tag_list_slide_speed = 500;
			if($tag_list.is(':animated')) return false;
			if($ths.hasClass('tag-list-prev')){
				if(tag_list_page == 1){ // 已经到第一个版面了,如果再向前，必须跳转到最后一个版面
					$tag_list.animate({left: '-=' + tag_list_slide_width * (tag_list_page_count - 1)}, tag_list_slide_speed); // 通过改变 left 值，跳转到最后一个版面
					tag_list_page = tag_list_page_count;
				}else{
					$tag_list.animate({left: '+=' + tag_list_slide_width}, tag_list_slide_speed); // 通过改变left值，达到每次换一个版面
					tag_list_page--;
				}
			}else if($ths.hasClass('tag-list-next')){
				if(tag_list_page == tag_list_page_count){ // 已经到最后一个版面了,如果再向后，必须跳转到第一个版面
					$tag_list.animate({left: 0}, tag_list_slide_speed); // 通过改变left值，跳转到第一个版面
					tag_list_page = 1;
				}else{
					$tag_list.animate({left: '-=' + tag_list_slide_width}, tag_list_slide_speed); // 通过改变left值，达到每次换一个版面
					tag_list_page++;
				}
			}
			return false;
		});

		// 点击标签后，把标签 ID 插入隐藏域
		/*$('#tag-list a').live('click', function(){
			var $ths = $(this),
				tag_arr = [],
				input_tags = $.trim($('#pin-tags').val()),
				input_tags_len = 0,
				$pin_tags_id = $('#pin-tags-id'),
				pin_tags_id_val = $pin_tags_id.val(),
				pin_tags_id_len = 0;
			if(input_tags){input_tags_len = input_tags.split(' ').length;}
			if(pin_tags_id_val){pin_tags_id_len = pin_tags_id_val.split(',').length;}
			if(!$ths.hasClass('selected') && pin_tags_id_len + input_tags_len >= 5){
				alert('最多只能添加 5 个标签');
			}else{
				$ths.toggleClass('selected');
				$('#tag-list').find('.selected').each(function(){
					tag_arr.push(this.id);
				});
				$pin_tags_id.val(tag_arr.join(','));
			}
			return false;
		});*/

		// 点击标签后，把标签 ID 插入标签框
		$('#tag-list a').live('click', function(){
			var $ths = $(this);
			if($ths.hasClass('selected')) return false;
			var $input_tags = $('#pin-tags'),
				input_tags = $.trim($input_tags.val()),
				input_tags_len = 0;
			if(input_tags){input_tags_len = input_tags.split(' ').length;} // 获取输入标签的个数
			if(input_tags_len >= 5){
				alert('最多只能添加 5 个标签');
			}else{
				$ths.addClass('selected');
				$input_tags.val(input_tags + ' ' + $ths.text()).blur().trigger('keyup');
			}
			return false;
		});

		// 采集网址图片
		$('#search-img-form').live('submit', function(){
			var $ths = $(this),
				url = $.trim($ths.find('input.search-pin').val());
			if(!url){// 如果网址为空
				$ths.find('.label').css('color', '#e34141');
				return false;
			}
			var $parent = $ths.parent();
			$parent.addClass('loading');
			$('#search-url').val(url);
			$.getJSON(this.action + url, function(d){
				$parent.removeClass('loading');
				if(d.status){
					alert("暂不支持该地址");// todo 后台还没提供该功能，如果提供了应改为 !d.status
				}else{
					var img_item_text = '',
						$img_list = $('#pin-img-list'),
						$img_item,
						img_len,
						page2 = 1;
					$.each(d.img, function(i, src){
						if(src.indexOf('http://') > -1) img_item_text += "<li class='img-item'><img src=" + src + " width='170' /></li>";
					});
					$img_item = $(img_item_text);
					img_len = $img_item.length;
					$img_list.html(img_item_text).width(img_len * 170);
					$('#img-src').val($img_item.eq(0).find('img').attr('src'));
					// 如果有多张图片，选择图片
					if(img_len > 1) select_pin_img($img_list, img_len, $img_item);
				}
			});
			return false;
		});

		// 采集网址视频
		$('#search-video-form').live('submit', function(){
			var $ths = $(this),
				$parent = $ths.parent(),
				$result = $parent.find('#result'),
				url = $ths.find('#url').val();
			if(!url){
				$result.html("<span style='color:red'>请输入视频地址</span>");
				return false;
			}
			$result.html("<span style='color:green'>视频加载中...</span>");
			$parent.find('#search-url').val(url);
			/*$('.open_vedio').live('click', function(){
				$(this).hide();
				$(this).next('.vedio').show();
			});
			$('.close_vedio').live('click', function(){
				$(this).parent().parent().hide();
				$(this).parent().parent().prev('.open_vedio').show();
			});*/
			$.ajax({
				url: this.action,
				data: {url: url},
				dataType: 'json',
				type: 'POST',
				success: function(json){
					if(!json.status){
						$result.html("<span style='color:red'>暂不支持该视频地址</span>");
						return false;
					}else{
						var html = "<a class='img' alt='"+json.data.title+"' href='"+json.data.url+"'>"+"<img src='"+json.data.img+"' />"+"</a>";
						$result.html(html);
						$parent.find('#video-url').val(json.data.url);
						$parent.find('#video-swf').val(json.data.swf);
						$parent.find('#video-title').val(json.data.title);
						$parent.find('#video-img').val(json.data.img);
						return false;
					}
				}
			});
			return false;
		});

		// 采集网址商品
		$('#search-goods-form').live('submit', function(){
			var url = $.trim($(this).find('input.search-pin').val());
			if(!url){
				$(this).find('.label').css('color', '#e34141');
				return false;
			}
			var $parent = $(this).parent();
			$parent.addClass('loading');
			$('#search-url').val(url);
			$.ajax({
				type: 'post',
				url: this.action,
				data: {url: url},
				success: function(d){
					$parent.removeClass('loading');
					var price = $.trim(d.price),
						$price = $('#goods-img .price'),
						desc = $.trim(d.description),
						img = d.img;
					$('#goods-desc').val(desc).blur();
					$('#goods-price').val(price);
					if(img){
						$('#goods-img .img img').attr({src: img, title: d.title});
						$('#goods-imgsrc').val(img);
						$('#goods-img .tips').removeClass('invalid');
					}else{
						$('#goods-img .img img').attr({src: '', title: ''});
						$('#goods-imgsrc').val('');
						$('#goods-img .tips').addClass('invalid');// 提示暂不支持该地址
					}
					if(!price){
						$price.html('');
					}else if(price.indexOf('<img') > -1){
						$price.addClass('price-img').html(price);
					}else{
						$price.html('￥' + price);
					}
				},
				dataType: 'json'
			});
			return false;
		});

		// 标签框中标签个数和长度验证
		$('#pin-info-form').find('input.tags')/*.live('blur', function(){
			var $ths = $(this),
				input_tags_arr = $.trim($ths.val()),
				input_tags_arr_len = 0;
			if(input_tags_arr){
				input_tags_arr = input_tags_arr.split(' ');
				input_tags_arr_len = input_tags_arr.length;
			}
			if(input_tags_arr_len > 5){
				$.dialog({
					content: '最多只能插入 5 个标签！',
					icon: 'error',
					time: 2
				});
			}else{
				var flag = false;
				for(var i = 0; i < input_tags_arr_len; i++){
					if(input_tags_arr[i].length > 15){
						flag = true;
						break;
					}
				}
				if(flag) {
					$.dialog({
						content: '标签最长为 15 个字！',
						icon: 'error',
						time: 2
					});
				}
			}
		})*/.live('keyup', function(e){
			var $ths = $(this),
				$dialog = $ths.parents('.dialog'),
				$tag_list_a = $dialog.find('.tag-list a'),
				input_tags_arr = $ths.val(),
				input_tags_arr_len = 0;
			if(input_tags_arr){
				input_tags_arr = input_tags_arr.split(' ');
				input_tags_arr_len = input_tags_arr.length;
			}

			// 如果是方式二，则只改变当前常用标签的样式
			if(this.id != 'pin-tags') $tag_list_a = $(this).parent().find('.tag-list a');
			$tag_list_a.removeClass('selected').filter(function(){
				for(var i = 0; i < input_tags_arr_len; i++){
					if($(this).text() == input_tags_arr[i]){
						return true;
						break;
					}
				}
				return false;
			}).addClass('selected');

			// 长度验证
			if(input_tags_arr_len > 5 && e.which != 8 && e.which != 46){// 标签个数大于 5 且不是删除操作
				$.dialog({
					content: '最多只能插入 5 个标签！',
					icon: 'error',
					time: 2
				});
				return false;
			}else{
				var flag = false;
				for(var i = 0; i < input_tags_arr_len; i++){
					if(input_tags_arr[i].length > 15){
						flag = true;
						break;
					}
				}
				if(flag) {
					$.dialog({
						content: '标签最长为 15 个字！',
						icon: 'error',
						time: 2
					});
				}
			}
		}).trigger('keyup');// 刷新

		// 采集 AJAX 提交
		$('#pin-info-form').live('submit', function(){
			var $ths = $(this),
				url = this.action,
				data = $ths.serialize(),
				$dialog = $ths.parents('.dialog'),
				//tags_arr = $('#pin-tags-id').val(),
				//tags_arr_len = 0,
				input_tags_arr = $.trim($('#pin-tags', this).val()),
				input_tags_arr_len = 0;
			/*if(tags_arr){
				tags_arr = tags_arr.split(',');
				tags_arr_len = tags_arr.length;
			}*/
			if(input_tags_arr){
				input_tags_arr = input_tags_arr.split(' ');
				input_tags_arr_len = input_tags_arr.length;
			}
			// 验证
			var desc = $.trim($ths.find('textarea').val());
			if(desc.length > 300){
				$.dialog({
					content: '描述内容最长为 300 个字！',
					icon: 'error',
					time: 2
				});
				return false;
			//}else if(tags_arr_len + input_tags_arr_len > 5){
			}else if(input_tags_arr_len > 5){
				$.dialog({
					content: '最多只能插入 5 个标签！',
					icon: 'error',
					time: 2
				});
				return false;
			}else{
				var flag = false;
				for(var i = 0; i < input_tags_arr_len; i++){
					if(input_tags_arr[i].length > 15){
						flag = true;
						break;
					}
				}
				if(flag) {
					$.dialog({
						content: '标签最长为 15 个字！',
						icon: 'error',
						time: 2
					});
					return false;
				}
			}

			// 提交时的状态
			$(".pin-info-submit", this).ajaxSend(function(){
					$(this).attr('disabled', true).text('稍候...');
				}).ajaxComplete(function(){
					$(this).removeAttr('disabled').text('采下来');
				});

			// 批量图片上传提交
			if($ths.hasClass('pin-info-form-batch')){
				var info = [];//, imgs = [], descs = [], tags = [];
				$ths.find('.pin-item').each(function(){
					var $self = $(this),
						img = $self.find('.img img').attr('src'),
						desc = $.trim($self.find('.desc').val()),
						tags = $.trim($self.find('.tags').val()).split(' '),
						info_json = $.parseJSON('{"img": "'+img+'", "desc": "'+desc+'"}');
					info_json.tags = tags;// 操蛋，直接写到 parseJSON 里会转成字符串
					info.push(info_json);
				});
				/*$ths.find('.img img').each(function(){
					imgs.push(this.src);
				});
				$ths.find('.pin-info-way-two .desc').each(function(){
					descs.push($.trim(this.value));
				});
				$ths.find('.pin-info-way-two .tags').each(function(){
					tags.push($.trim(this.value).split(' '));
				});*/
				if(!info[0]) {
					// alert('请先上传图片，再提交！');
					$.dialog({
						content: '请先选择上传文件，再提交采集！',
						icon: 'error',
						time: 2
					});
					return false;
				}
				data = $ths.find('input:hidden, :radio').serialize();
				$.post(url + '&' + data, {'info': info}, function(d){
					if(d != 0){
						/*$.dialog({
							content: '文件采集成功，请选择下一步操作！',
							icon: 'succeed',
							ok: function () {
								location = document.referrer;
								return false;
							},
							okVal: '返回上页',
							cancelVal: '继续上传',
							cancel: function(){
								window.location.reload();
							}
						});*/
						$page_overlay.show();
						$(d).appendTo('body');
					}else{
						alert('抱歉采集提交出错，请重新采集！');
					}
				});
			}else{
				// 其它采集提交
				//$.post(url + '&' + data, {"tags_arr": tags_arr, 'input_tags_arr': input_tags_arr}, function(d){
				$.post(url + '&' + data, {'input_tags_arr': input_tags_arr}, function(d){
					if(d == 0){
						alert('抱歉采集提交出错，请重新采集！');
					}else{
						$dialog.remove();
						$(d).appendTo('body');
					}
				});
			}
			return false;
		});

		/*********** 上传采集 ***********/
		// 显示上传选择弹窗
		$('#upload-pin-form .fbtn').live('mouseenter', function(){
			$('#upload-select-dialog').show();
		}).live('mouseleave', function(){
			$('#upload-select-dialog').delay(5000).hide();
		});

		$('#upload-dialog-closer').die('click').on('click', function(){
			location = document.referrer || "/index.php?m=community&c=index&a=index";
		});

		// 隐藏上传选择弹窗
		$('#upload-select-dialog').find('.upload-closer').live('click', function(){
			$(this).parent().hide();
		});
		/*$('#upload-pin-form').live('submit', function(){
			var $ths = $(this),
				$dialog = $ths.parent(),
				url = this.action,
				data = $ths.serialize();
				//data = $('#upload-file').val();
			// 上传图片
			$.post(url, data, function(d){
				if(d){
					$.get('/index.php?m=community&c=myhuoshow&a=myupload', function(d){
						$dialog.hide();
						$(d).appendTo('body');
					});
				}
			});
			return false;
		});*/

		// 批量上传页
		var $upload_output = $('#upload-output');
		// 方式一中的输入内容同步到方式二中
		$upload_output.find('.pin-info-way-one .desc').live('keyup', function(){
			$(this).parents('.pin-info-way-one').next('.pin-info-way-two').find('.desc').val(this.value).blur();
			/*$(this).parents('.pin-info-way-one').next('.pin-info-way-two').find('.desc').each(function(){
				$(this).val(val);
			});*/
		});
		$upload_output.find('.pin-info-way-one .tags').live('keyup', function(){
			$(this).parents('.pin-info-way-one').next('.pin-info-way-two').find('.tags').val(this.value).blur();
		});
		// 删除该图片
		$upload_output.find('.del-pin').live('click', function(){
			//$(this).parent().fadeOut(300, function(){
			$(this).parents('.progressWrapper').fadeOut(300, function(){
				$(this).remove();
			});
		});
		// 显示常用标签
		$upload_output.find('.pin-item-info .tags').live('focus', function(){
			$(this).siblings('.select-tags').show();
		});
		// 隐藏常用标签
		$upload_output.find('.tags-close').live('click', function(){
			$(this).parents('.select-tags').hide();
		});

		// 单文件上传按钮点击
		$('#upload-pin-form').live('submit', function(){
			//var options = {target: '#upload-output'};
			$(this).ajaxSubmit({
				target: '#upload-output',
				success: function(){
					initDivselect();
					// 隐藏上传选择弹窗
					$('#upload-select-dialog').find('.upload-closer').click();
					// 移动弹窗到
					/*$('#upload-pin-dialog').has('.pin-info-form-batch').appendTo($page_overlay).css({
						'position': 'absolute',
						'top': '0'
					});*/
					//if(isIE) $page_overlay.css({'opacity': 1});
				}
			});
			return false;
		}).find('.upload-file').live('change', function(){// 内容改变时触发提交
			//if($(this).hasClass('upload-file-batch')) $('#upload-pin-form').attr('action', '/index.php?m=community&c=myhuoshow&a=batch_upload');
			$('#upload-pin-form').submit();
		});

		// 创建专辑弹窗验证
		$('#create-album-name').live('blur', function(e){// 不支持添加多个事件
			var $ths = $(this), album_name = $.trim($ths.val());
			if(album_name){
				if(album_name.length > ALBUM_NAME_LEN){
					$ths.next().attr('class', 'data-invalid').text('专辑名最大长度为 15 个字');// 限制专辑名长度
				}else{
					$.get('/index.php?m=community&c=index&a=is_censor', {"content": album_name}, function(d){
						if(d == 1){
							$ths.next().attr('class', 'data-valid').text('');
						}else if(d == 2){
							$ths.next().attr('class', 'data-invalid').text('该专辑名已经存在！');
						}else{
							$ths.next().attr('class', 'data-invalid').text('该词被河蟹了！');
							$('#create-album-form').click(function(){
								return false;
							});
						}
					});
				}
			}else{
				$ths.next().attr('class', 'data-invalid').text('请输入专辑名称');
			}
		}).live('keyup', function(){// 限制专辑名长度
			var $ths = $(this), album_name = $.trim($ths.val());
			if(album_name){
				if(album_name.length > ALBUM_NAME_LEN){
					$ths.next().attr('class', 'data-invalid').text('专辑名最大长度为 15 个字');
				}else{
					$ths.next().attr('class', 'data-valid').text('');
				}
			}else{
				$ths.next().attr('class', 'data-invalid').text('请输入专辑名称');
			}
		});
		$('#create-album-form').live('submit', function(){
			$('#create-album-name').blur();
			var desc = $.trim($('#album-desc').val());
			//if($('#create-album-name').next().hasClass('data-invalid')) return false;
			if($(this).find('.data-invalid').length > 0){
				return false;
			}else if(desc.length > 300){// 验证专辑长度
				$('#album-desc').blur();
				return false;
			}
		});

		// 上传到专辑
		/*$('#upload-button').live('click', function(){
			$(this).parent().find('#upload-file').click();
		});*/

		// 关注选中的专辑 AJAX 提交
		$('#wrapper .btn-follow-album').click(function(){
			var url = '/index.php?m=community&c=firstlogshow&a=follow_album&dosubmit=yes',
			data = [];
			$(this).parents('#wrapper').find('.album-item.selected').each(function(){
				data.push($(this).attr('data-id'));
			});
			$.post(url, {'dataid': data}, function(data){
				window.location = data;
			});
			return false;
		});
		// 关注选中的用户 AJAX 提交
		$('#wrapper.follow-pinner .btn-follow-pinner').click(function(){
			var url = '/index.php?m=community&c=firstlogshow&a=follow_user&dosubmit=yes'
			data = [];
			$(this).parents('#wrapper').find('.pinner.selected').each(function(){
				data.push($(this).attr('data-id'));
			});
			$.post(url, {'dataid': data}, function(data){
				if(data == '0'){
					alert('你已经关注过了！');
					window.location = '/index.php?m=community&c=firstlogshow&a=create_album';
				}else{
					window.location = data;
				}
			});
		});

		/*====================其它页页面=====================*/
		// 分类页显示更多分享
		var $cats_more_btn = $('#cats-more-btn'),
			$cats_more = $('#cats-more');
		$cats_more_btn.hover(function(e){
			$cats_more.show();
			$cats_more_btn.addClass('hover');
		},function(e){
			if($cats_more.find(e.relatedTarget).length || $cats_more.is(e.relatedTarget)) return;
			$cats_more.hide();
			$cats_more_btn.removeClass('hover');
		});
		$cats_more.mouseleave(function(e){
			if($cats_more_btn.find(e.relatedTarget).length || $cats_more_btn.is(e.relatedTarget)) return;
			$cats_more_btn.trigger('mouseleave');
		});

		// 添加专辑
		$('#action-add-album a').click(function(){
			var new_album_str = '<div class="new-album fancy fn-hide"><input type="text" class="input"><label class="label">请输入专辑名称</label><a href="javascript:;" hidefocus="true" class="close">X</a></div>';
			$(new_album_str).insertBefore(this.parentNode).fadeIn(700);
		});
		// 删除专辑
		$('#add-album-form .new-album .close').live('click', function(){
			$(this).parent().fadeOut(function(){
				$(this).remove();
			});
		});
		// 专辑名验证
		$('#add-album-form .input').live('blur', function(){
			if($(this).val().length > 15) {
				$.dialog({
					content: "专辑名最大长度为 15 个字！",
					icon: "warning",
					follow: this,
					time: 2
				});
			}
		});
		// 提交专辑
		$('#add-album-form').submit(function(){
			var url = this.action;
			var data= [];
			$(this).find('.input').each(function(){
				var val = $.trim(this.value);
				if(val && val.length <= 15){
					data.push(this.value);
				}else{
					var color = $(this).css('color');
					$(this).blur().css('color', '#DA0600').delay(1000).animate({color: color}, 700);
					return false;
				}
			});
			if(data.length < 1){
				var $first_label = $('.label', this),
					color = $first_label.css('color');
				$first_label.css('color',"#DA0600").delay(1000).animate({color: color}, 700);
				/*$.dialog({
					content: "请输入你的专辑名称！",
					icon: "warning",
					time: 2
				});*/
				return false;
			}
			$.post(url, {'data': data}, function(d){
				if(d){
					window.location = d;
				}else{
					alert('创建专辑失败！');
				}
			})
			return false;
		});

		// 关注专辑
		$('.follow-album').live('click', function(){
			if(!user_id){
				openLoginDialog();
				return false;
			}
			var $ths = $(this),
				url = this.href,
				text = $ths.text();
			if(text == '取消关注'){
				$.get(url, {"action": "cancel"}, function(d){
					if(d == 1){
						if($ths.hasClass('dbtn')){
							$ths.removeClass('followed').text('关注该专辑');
						}else{
							$ths.removeClass('followed').text('关注');
						}
					}else{
						$.dialog('>_< 糟糕，取消关注失败！');
					}
				});
			}else{
				$.get(url, {"action": "follow"}, function(d){
					if(d == 1){
						$ths.addClass('followed').text('取消关注');
					}else{
						$.dialog('>_< 糟糕，关注专辑失败！');
					}
				});
			}
			return false;
		});

		// XXX修改专辑页面－删除专辑
		$('#del-album-btn').click(function(){
			return;// [后台要用他自已写的，此事件暂时不用]
			var url = this.href;
			$.dialog({
				content: "确定要删除专辑该专辑吗？",
				//width: '400px',
				icon: "warning",
				okVal: "删除",
				cancel: true,
				ok: function(){
					$.get(url, function(d){
						if(d !== '删除专辑失败'){
							$.dialog({
								content: "删除专辑成功！",
								icon: 'succeed',
								close: function(){
									window.location = d;
								},
								time: 2
							});
						}else{
							$.dialog({
								content: "删除专辑失败！",
								icon: 'error',
								time: 2
							});
						}
					});
				}
			});
			return false;
		});

		// 修改专辑页面－专辑提交验证
		var $edit_album_form = $('#edit-album-form'), $select_cover_dialog = $('#select-cover-dialog');
		$edit_album_form.on('blur', '#album-name', function(){
			var val = $.trim(this.value);
			if(!val){
				$.dialog({
					content: '专辑名称不能为空！',
					icon: 'error',
					follow: this,
					time: 2
				});
			}else if(val.length > 15){
				$.dialog({
					content: '专辑名称最长为 15 个字！',
					icon: 'error',
					follow: this,
					time: 2
				});
			}
		});
		$('#album-desc, #pin-desc').live('blur', function(){
			var val = $.trim(this.value);
			if(val.length > 300){
				$.dialog({
					content: '补充描述最长为 300 个字！',
					icon: 'error',
					follow: this,
					time: 2
				});
			}
		});
		$edit_album_form.submit(function(){
			var name = $.trim($('#album-name').val());
			var desc = $.trim($('#album-desc').val());
			if(!name || name.length > 15){
				$('#album-name').blur();
				return false;
			}else if(desc.length > 300){
				$('#album-desc').blur();
				return false;
			}
		});
		// 选择封面按钮
		$('#set-album-cover').on('click', 'input', function(){
			var $ths = $(this);
			if($ths.hasClass('multi')){// 如果点击九宫格
				$edit_album_form.find('.ui-album .multi-img').show().siblings().hide();
			}else{
				if($edit_album_form.find('.ui-album .single-img img').attr('src')){
					$edit_album_form.find('.ui-album .single-img').show().siblings().hide();
				}
				$select_cover_dialog.show();
			}
		}).find('input.multi').click();
		// 选择封面照片弹窗
		$select_cover_dialog.on('click', '.body .img', function(){
			var $ths = $(this),
				src = $ths.find('img').attr('src'),
				img_id = $ths.find('img').attr('data-id');
			$ths.addClass('selected').siblings().removeClass('selected');
			$select_cover_dialog.fadeOut(100);
			// 显示单图封面，并设置图片地址
			$edit_album_form.find('.ui-album .single-img').show().find('img').attr('src', src)
				.end().siblings().hide();// 隐藏九宫格封面
			$('#img-id').val(img_id);// 设置图片的 ID 值给隐藏域
			return false; // 解决 IE6 操蛋的图片阻塞问题
		}).on('click', '.closer', function(){
			$(this).parent().hide();
			// 如果单图封面的图片地址为空，则显示九宫格封面
			if(!$edit_album_form.find('.ui-album .single-img img').attr('src')) $('#set-album-cover').find('input.multi').click();
		});

		// 编辑分享提交
		$('#edit-pin-form').submit(function(){
			var url = this.action,
				desc = $.trim($('#pin-desc').val()),
				typeid = $('.inputselect', this).val(),
				tags = $.trim($('input.tags', this).val()),
				tags_len = 0,
				tags_default = $.trim($('input.tags-default', this).val()).split(' '),
				status = $('.status', this).val();

			// 验证
			if(tags){// 如果标签不为空
				tags = $.trim($('input.tags', this).val()).split(' ');
				tags_len = tags.length;
			}
			if(tags_len > 5){ // 如果标签超过 5 个
				$.dialog({
					content: '最多只能插入 5 个标签！',
					icon: 'error',
					time: 2
				});
				return false;
			}else{ // 验证标签长度
				for(var i = 0; i < tags_len; i++){
					if(tags[i].length > 15){ // 如果验证长度超过 15 个字
						$.dialog({
							content: '标签最长为 15 个字！',
							icon: 'error',
							time: 2
						});
						return false;
					}
				}
			}
			if(desc.length > 300){ // 验证描述长度
				$('#pin-desc').blur();
				return false;
			}
			$.post(url, {"desc": desc, "typeid": typeid, "tags": tags, "tags_default": tags_default, "status": status}, function(d){
				$('body').html(d);
			});
			return false;
		});

		// 我的火秀页，设置用户菜单
		/*$('#pinner-nav a').click(function(){
			$(this).addClass("current").siblings().removeClass("current");
			$.cookie( "navid", this.id, {path: '/', expires: 10});
		});
		var cookie_nav = $.cookie("navid");
		if(cookie_nav){
			$("#"+cookie_nav).trigger('click');
		}*/

		// 我的关注&粉丝 - 名片
		$('#wrapper.fans-page > .fans > .avatar').hover(function(){// 鼠标移到用户头像上时
			$(this.parentNode).find('.card').show();
		},function(){
			$(this.parentNode).find('.card').hide();
		});
		$('#wrapper.fans-page .card').hover(function(){// 鼠标移到名片上时
			$(this).show();
		},function(){
			$(this).hide();
		}).first().addClass('first');
		//alert($('#wrapper .card:first').offset().top);
		$('#wrapper.fans-page > div:even').addClass('odd'); // 奇偶行样式

		// 关注用户&专辑页
		$('#wrapper.follow-pinner .pinner, #wrapper.follow-albums .album-item').live('click', function(){
			var $albums = $(this).parents('.albums'),
				$checkbox = $albums.find(':checkbox');
			$(this).toggleClass('selected');
			if($albums.find('.album-item').length == $albums.find('.album-item.selected').length){
				$checkbox.attr('checked', true);
			}else{
				$checkbox.attr('checked', false);
			}
		});
		$('#wrapper.follow-albums .albums :checkbox').click(function(){
			if(this.checked){
				$(this).parents('.albums').find('.album-item').addClass('selected');
			}else{
				$(this).parents('.albums').find('.album-item').removeClass('selected');
			}
		});
		$('#wrapper.follow-albums .albums').on('click', '.up', function(){// 收起
			$(this).parent().next('.album-list').slideToggle('fast');
		});

		// 查找&邀请好友页
		$('#bind-social > dt').click(function(){
			var $ths = $(this);
			$ths.addClass('selected').siblings('dt').removeClass('selected').siblings('dd').hide();
			$ths.next('dd').show();
		});
		$('#bind-social > dd > .sbtn').click(function(){
			$(this).parent().hide().next('dd').show();
		});

		// 邀请好友滚动列表
		$('#invite_friends_slide .slide_list_item').live('click', function(){
			var $ths = $(this);
			if($ths.hasClass('selected')){
				$ths.removeClass('selected').find('span').remove();
			}else{
				$ths.addClass('selected').append('<span />');
			}
			});
		/*====== 加载并执行jquery.eslider.js ======*/
		if($('#invite_friends_slide').length) {
			$.getScript("/statics/js/jquery.eslider.js", function(){
				$('#invite_friends_slide').eslider({i: 9});
			});
		}

		// 广场页，热门标签表格选择奇数行添加类 odd
		$('#wrapper.square .popular-tags tr:odd').addClass('odd');
		// 广场页，专辑滚动
		var $album_slider = $('#ui-album-slider'), scrollTimer;
		$album_slider.hover(function(){
			clearInterval(scrollTimer);
		},function(){
			scrollTimer = setInterval(function(){
				var scroll_width = $album_slider.children("li").width(); //获取滚动宽度
				$album_slider.animate({"margin-left" : -scroll_width +"px" }, 600, function(){
					$album_slider.css("margin-left",0).children("li:first").appendTo($album_slider); //appendTo 能直接移动元素
				});
			}, 3000);
		}).trigger("mouseleave");

		// 专辑列表，鼠标移到专辑图片上显示关注、分享按钮
		$('.ui-album').live('hover', function(e){
			if(e.type == 'mouseenter'){
				$(this).find('.action').show();
			}else{
				$(this).find('.action').hide();
			}
		});

		// 专辑列表首页，鼠标移到创建专辑上显示创建专辑菜单
		$('#wrapper.album-list .create-album, #canvas .album-list .create-album').hover(function(){
			$(this).find('.create-album-list').stop(true, true).slideToggle('fast');
		});

		// 用户专辑页分享到键钮
		$('#jt-share-list').hover(function(){
			$('ul', this).removeClass('fn-hide');
		}, function(){
			$('ul', this).addClass('fn-hide');
		});

		// 专辑列表首页，专题标题点击显示相应专辑列表
		var $album_title_list_li = $('#album-title-list a');
		$album_title_list_li.click(function(){
			var index_this = $album_title_list_li.index(this),
			$parent = $(this).parent();
			$parent.addClass('selected').siblings().removeClass('selected');
			//$parent.parent().siblings('.album-content-list').addClass('fn-hide').eq(index_this).removeClass('fn-hide');
			//return false;
		});

		// 专辑详细页评论 AJAX 提交
		/*$('#js-comment-form').submit(function(){
			if(!user_id){
				openLoginDialog();
				return false;
			}
			var $ths = $(this),
				url = this.action,
				comment = $.trim($ths.find('textarea').val()),
				$comment_num = $('#comment-num'),
				comment_num = parseInt($comment_num.text());
			if(!comment) {
				alert('评论内容不能为空！');
				return false;
			}else if(comment.length > 300){
				alert('评论内容不能超过 300 字！');
				return false;
			}
			$.post(url, {"album_comment": comment}, function(d){
				var $comment_item = $('#js-comment-list .comment-item');
				if($comment_item.length > 4) $comment_item.last().slideUp(function(){$(this).remove();});
				$(d.data.comment).prependTo('#js-comment-list').hide().slideDown(370);
				$('#pagination').html(d.data.page);
				$comment_num.text(comment_num + 1);
				$ths[0].reset();
			}, 'json');
			return false;
		});*/
		// 我的专辑页 AJAX 翻页
		$('#js-album-list .pagination a').live('click', function(){
			var url = this.href;// 有个 data-id 给值是最好的
			var $ths = $(this);
			var $comment_list = $('#js-comment-list');
			if($ths.hasClass('current')) return false;
			$.get(url, function(d){
				var $parent = $ths.parent();
				$parent.prevUntil('.title').remove();
				$parent.before(d).remove();
			});
			return false;
		});

		// 分享详细页评论 AJAX 提交
		$('#js-pin-comments').on('submit', '#show-comment-form', function(){
			if(!user_id){
				openLoginDialog();
				return false;
			}
			var $ths = $(this),
				url = this.action,
				comment = $.trim($ths.find('textarea').val());
			if(!comment) {
				alert('评论内容不能为空！');
				return false;
			}else if(comment.length > 300){
				alert('评论内容不能超过 300 字！');
				return false;
			}
			$.post(url, {"share_comment": comment}, function(d){
				var $comment_item = $('#show-comment-list li');
				if($comment_item.length > 4) $comment_item.last().slideUp(function(){$(this).remove();});
				// 插入数据
				$(d.data.comment).prependTo('#show-comment-list').hide().slideDown(370);
				$('#pager').html(d.data.page);
				$ths[0].reset();
			}, 'json');
			return false;
		});
		// 分享详细页评论列表 AJAX 翻页
		$('#pager').on('click', 'a', function(){
			//url: /index.php?m=community&c=index&a=share_comment_list&share_id=161&page=2
			var url = this.href.replace('a=show', 'a=share_comment_list'); // 操蛋
			if($(this).hasClass('current')) return false;
			$.get(url, function(d){
				var $d = $(d),
					comment_html = $(d).filter('#comment').html(),
					pager_html = $(d).filter('#pager').html();
				$('#show-comment-list').html(comment_html);
				$('#pager').html(pager_html);
			});
			return false;
		});
		// 删除评论
		$('#js-pin-comments').on('click', '#show-comment-list .del', function(){
			var $ths = $(this);
			$.get(this.href, function(d){
				if(d != 0){
					$ths.parents('.comment-item').fadeOut(function(){
						$(this).remove();
					});
					$('#show-comment-list').html($(d).filter('#comment').html());
					$('#pager').html($(d).filter('#pager').html());
				}
			});
			return false;
		});

		// 账号设置页
		$('#accont-settings-form').submit(function(){
			var $ths = $(this), $nickname = $('input.nickname', this), nickname = $.trim($nickname.val()), $signature = $('textarea.signature', this), signature = $.trim($signature.val());
			if(nickname.length > 15){
				alert('昵称最长为 15 个字！');
				return false;
			}else if(signature.length > 30){
				alert('签名最长为 30 个字！');
				return false;
			}
		});

		// 大图页评论提交
		var $zoomer_comment =$('#zoomer-comment');
		$zoomer_comment.on('submit', 'form', function(){
			if(!user_id){
				openLoginDialog();
				return false;
			}
			var $ths = $(this),
				url = this.action,
				comment = $.trim($ths.find('textarea').val()),
				$comment_count = $('#zoomer-comment-count'),
				comment_num = $comment_count.text() - 0;
			if(!comment) {
				alert('评论内容不能为空！');
				return false;
			}else if(comment.length > 300){
				alert('评论内容不能超过 300 字！');
				return false;
			}
			$.post(url, {"share_comment": comment}, function(d){
				var $comment_item = $('#zoomer-comment-list li');
				if($comment_item.length > 5) $comment_item.last().slideUp(function(){$(this).remove();});
				// 插入数据
				$(d.data.comment).prependTo('#zoomer-comment-list').hide().slideDown(370);
				$('#pagination').html(d.data.page);
				$ths[0].reset();
				$comment_count.text(comment_num + 1);// 统计数加 1
			}, 'json');
			return false;
		});
		// 大图页评论删除
		$zoomer_comment.on('click', '.del', function(){
			var $ths = $(this);
			$.get(this.href, function(d){
				if(d != 0){
					$ths.closest('li').fadeOut(800, function(){$(this).remove();});
					$zoomer_comment.html($(d).html());
					//$('#pager').html($(d).filter('#pagination').html());
				}
			});
			return false;
		});

		// 初始化 divselect
		initDivselect();

		// 操蛋的遮罩
		if(isIE6){
			$('#show-overlay').height($('body').height() - 79);
		}else if($.browser.webkit){
			$('#show-overlay').height($(document).height()); // 操蛋的谷歌浏览器
		}else{
			$('#show-overlay').height($(document).height() - 79);
		}

		/*====================共用函数=====================*/
		// 打开/关闭登录弹窗函数
		function openLoginDialog() {
			//$('#loginbar').fadeIn();
			$page_overlay.slideDown();
			$login_dialog.slideDown();
			if(isIE6){
				$(window).scrollTop(0);
				$('html').css('overflow', 'hidden');
			}else{
				$body.css('overflow', 'hidden');
			}
		}
		function closeLoginDialog() {
			$login_dialog.slideUp('fast');
			$page_overlay.slideUp('fast');
			if(isIE6){
				$('html').css('overflow', 'auto');
				$('html').css('overflow-x', 'hidden');//todo
			}else{
				$body.css('overflow', 'auto');
			}
		}

		// 弹窗通用函数
		var openDialog = function(dialogId, hasDivselect, dosearch){
			var $dialog = $('#' + dialogId);
			if($dialog.length){
				$dialog.show();
			}else{
				$.get(dialog_url, function(d){
					var $dialog = $(d).filter('#' + dialogId);
					$dialog.appendTo('body').show(function(){
						//todo
					});
					if(hasDivselect) initDivselect();
					if(dosearch) dosearch($dialog.find('.search-pin-form'));
				});
			}
			if(isIE6){
				$('html').css('overflow', 'hidden');
				//$('html').css('overflow-x', 'hidden');//todo
			}else{
				$body.css('overflow', 'hidden');
			}
			$page_overlay.show();
			//closeDialog();
		}

		/*var closeDialog = function(istrigger, showOverlay){
			var $close = $('.dialog .close');
			$close.live('click', function(){
				var $dialog = $(this).parents('.dialog');
				//alert($dialog.length);
				$dialog.hide();
				if(!showOverlay) $page_overlay.hide();
				$body.css('overflow', 'auto');
				$dialog.find('form').trigger('reset');// 重置表单
			});
			if(istrigger) $close.triggerHandler('click');
		}*/

		// 采集图片，翻页选择图片
		var select_pin_img = function ($img_list, img_len, $img_item){
			var $img_nav = $img_list.next('.img-nav'), page = 1;
			$img_nav.find('.next').removeClass('disabled');
			$img_nav.find('.prev').click(function(){// 上一张
				if(!$img_list.is(":animated")){
					if(page != 1){// 已经到第一个版面了
						if(page == img_len) $(this).next().removeClass('disabled');
						$img_list.animate({left: '+=170px'});//通过改变left值，达到每次换一个版面
						page--;
						if(page == 1) $(this).addClass('disabled');
						$('#img-src').val($img_item.eq(page-1).find('img')[0].src);
					}
				}
				return false;
			});
			$img_nav.find('.next').click(function(){// 下一张
				if(!$img_list.is(":animated")){
					if(page != img_len){
						if(page == 1) $(this).prev().removeClass('disabled');
						$img_list.animate({left: '-=170px'});//通过改变left值，达到每次换一个版面
						page++;
						if(page == img_len) $(this).addClass('disabled');
						$('#img-src').val($img_item.eq(page-1).find('img')[0].src);
					}
				}
				return false;
			});
		}

		// 初始化 divselect 函数
		function initDivselect() {
			var $divselect = $('.divselect');
			if($divselect.length) {// 判断是否有 divselect
				if(!$.divselect){// 判断插件是否已加载
					$.getScript("/statics/js/jquery.divselect.js", function(){
						$.divselect(".divselect", ".inputselect");
					});
				}else{
					$.divselect(".divselect", ".inputselect");
				}
				$body.on('click', function(){ $divselect.find('.options').hide(); });
				// 创建专辑
				var $create_album_btn = $divselect.find('.create-album .button');
				$divselect.find('.create-album').on('click', function(){
					$divselect.find('.options').show();
					return false;
				});
				$divselect.find('.create-album input').on('focus', function() {
					var this_val = $.trim(this.value);
					if(this_val == this.defaultValue){
						this.value='';
						$create_album_btn.addClass('disabled');
					}else if(this_val != '' && this_val.length < 16) {
						$create_album_btn.removeClass('disabled');
					}
				}).on('blur', function() {
					var this_val = $.trim(this.value);
					if(this_val == ''){
						this.value = this.defaultValue;
						$create_album_btn.addClass('disabled');
					}else if(this_val != this.defaultValue) {
						if(this_val.length > 15){
							//alert('专辑名最长为 15 个字！');
							$create_album_btn.addClass('disabled');
						}else{
							$create_album_btn.removeClass('disabled');
						}
					}
				}).on('keyup', function() {
					var this_val = $.trim(this.value);
					if(this_val != this.defaultValue && this_val != '') {
						if(this_val.length > 15){
							alert('专辑名最长为 15 个字！');
							$create_album_btn.addClass('disabled');
						}else{
							$create_album_btn.removeClass('disabled');
						}
					}else{
						$create_album_btn.addClass('disabled');
					}
				});
				$create_album_btn.click(function(){
					if($(this).hasClass('disabled')) return false;
					var $last_option = $divselect.find('.option:last');
					var option_selectid_text = $.trim($divselect.find('.create-album input').val());
					$.post('/index.php?m=community&c=index&a=ajax_add_album', {"album_text": option_selectid_text}, function(d){
						if(d == 0){
							alert('创建专辑失败，请联系管理员！');
						}else if(d == 2){
							alert('相同标题的专辑已经存在');
						}else{
							$last_option.parent().after("<li><a class='option' hidefocus='true' href='javascript:;' " + d + ">" + option_selectid_text + "</a></li>");
							// 滑动到列表底部
							$divselect.find('.option-list').animate({'scrollTop': $divselect.find('.option').length * 32});
							// 清空输入框
							$divselect.find('.create-album input').val('');
							$create_album_btn.addClass('disabled');// 禁用按钮
						}
					});
					return false;
				});
			}
		}

		// 设置当前导航菜单
		/*function setCurNav(navid){
			$("#"+navid).addClass("current").siblings().removeClass("current");
			$.cookie( "navid", navid, {path: '/', expires: 10});
		}*/

		/*====================浏览器兼容性解决方案=====================*/
		if(isIE6){ // if($.browser.msie && $.browser.version == '6.0'){
			// 解决 IE6 hover Bug
			$('#add, .ui-album .intro, #wrapper.album-list .album-title-list li, .ui-album .intro, .jt-box-list li, #pin-toolbar .share-button, #nav .nav-item, #main .pin-show .pin-cnt').live('hover', function(){$(this).toggleClass('hover');});
			$canvas.find('.pin').live('hover', function(){$(this).toggleClass('pin-hover');});
			//var width = $('#canvas .category .cats-list li').width();
			//$('#canvas .category .cats-list li').css('width', width);
			// 操蛋的 IE6 最大高度问题
			$('.ui-album .intro').live('hover', function(){
				var $p = $('p', this), text = $p.text();
				if(text.length > 90) $p.text(text.substring(0, 90));
			});
		}

		if(isIE6 || isIE7){
			// 解决 IE6, IE7 用户名片在 不能到最上面的问题
			$('#canvas .pin').live('hover', function(e){
				if(e.type == 'mouseenter'){
					$(this).css('z-index', 2);
				}else{
					$(this).css('z-index', 1);
				}
			});
			$('.input').live('focus', function(){$(this).toggleClass('focus');});
			$('#wrapper.user-album .album-actions').hover(function(){// 解决 IE6、IE7 下一个蛋疼的问题
				$('#wrapper').css('z-index', '10');
			},function(){
				$('#wrapper').css('z-index', '1');
			});
			//$('#menu_user ul li').hover(function(){$(this).toggleClass('hover');});
			$('.pin-info-form .submit').live('hover', function(e){
				if(e.type == 'mouseenter'){
					$(this).css('z-index', 11);
				}else{
					$(this).css('z-index', 1);
				}
			});
		}
	});

	/*====================页面加载完执行=====================*/
	$(window).load(function() {
		// 专辑列表分享到
		var $canvas = $('#canvas, #wrapper.square');
		$canvas.on('hover', '.jt-share', function(e){
			var $parent = $(this).parent(),
				position = $parent.position(),
				x = position.left + $(this).position().left,
				y = position.top + 27,
				$jtbox = $parent.next('.jt-box');
			if(e.type == 'mouseenter'){
				//if($(window).height() - $parent.offset().top < $jtbox.height()){// 如果下面不显示分享到层，则显示到上面
					//$jtbox.css({left: x, top: 'auto', bottom: $parent.parent().height() - position.top}).show();
				//}else{
					$jtbox.css({left: x, top: y, bottom: 'auto'}).show();
				//}
			}else{
				$jtbox.hide();
			}
		});

		// 控制关注工具条的显隐
		$canvas.on('hover', '.jt-box', function(e){
			var $ths = $(this), $action_bar = $(this).prev();
			if(e.type == 'mouseenter'){
				$ths.show();
				$action_bar.show();
			}else{
				$ths.hide();
				$action_bar.parent().hover();
			}
		});

		// 打开分享窗口
		$canvas.on('click', '.jt-box-list a', function(){
			var $ths = $(this),
				$ths_ulbum = $ths.parents('.ui-album'),
				$intro = $ths_ulbum.find('.intro'),
				url = $ths_ulbum.find('.img').attr('href'),
				title = $('h3', $intro).text(),
				summary = $('p', $intro).text();
			$(this).jtShare({title: title, summary: summary, url: url});
		});

		// 专辑详细页分享到
		$('#jt-share-list').on('click', '.jt-share', function(){
			var title = $(this).parents('#jt-share-list').attr('data-t');
			$(this).jtShare({title: title});
		});

		// 分享详细页分享到
		$('#pin-toolbar').on('click', '.share-button', function(){
			var $ths = $(this),
				$parent = $ths.parent(),
				title = $parent.attr('data-t'),
				summary = $parent.attr('data-s'),
				pic = $parent.attr('data-p');
			$ths.jtShare({title: title, summary: summary, pic: pic});
		});

		// 分享详细页显示放大图标
		$('#pin-img').on({
			mouseenter: function(){
				$('#zoom-view').animate({top: 0, right: 0}, 100);
			},
			mouseleave: function(){
				$('#zoom-view').stop(true).animate({top: '-50px', right: '-50px'}, 200);
			}
		});

		// 详细页图片滚动
		var $pin_slide = $('#pin-slide');
		if($pin_slide.length){
			$pin_slide.jcarousel({
				scroll: 10
			});
		}

		// 分享导航
		$pin_slide.on('click', '.jcarousel-item a', function(){
			var url = this.href;
			getPin(url);
			return false;
		});

		// 上一个或下一个分享
		$('#js-pin-show').on('click', '.pin-nav-btn', function(){
			var url = this.href;
			getPin(url);
			return false;
		});

		// 获取分享函数
		function getPin(url){
			$.get(url, function(data){
				var $data = $(data),
					$pin_cnt = $data.find('#pin-slide').nextAll(),// 获取图片导航后的元素
					pin_comments_str = $data.find('#js-pin-comments').html(),// 获取评论的 HTML
					pager_str = $data.find('#pager').html();// 获取评论翻页的 HTML
				$('#main').find('.jcarousel-skin-myshow').nextAll().remove().end().after($pin_cnt);
				$('#js-pin-comments').html(pin_comments_str);
				$('#pager').html(pager_str);
			});
		}

		// 大图页分享到
		$('#zoomer-share').on('click', function(){
			$(this).jtShare({pic: $('#zoomer-img').attr('src')});
		});

		// 大图页图像拖动
		var $zoomer = $('#zoomer');
		if($zoomer.length){
			if(isIE6){
				var window_height = $(window).height(),
					window_width = $(window).width();
				$zoomer.height(window_height);
				$zoomer.find('.aside').height(window_height - 108);
				$zoomer.find('.body').height(window_height - 88);
				$zoomer.find('.body').width(window_width - 255);
				$zoomer.find('.footer').width(window_width - 17);
				$('html').css('overflow', 'hidden');
			}
			$.getScript('/statics/js/jquery.event.drag.js', function(){
				$('#zoomer-img').drag("start",function(){
					$(this).addClass("ondrag");
				}).drag(function(e, d){
					$(this).css({top: d.offsetY, left: d.offsetX});
				}).drag("end",function(){
					$(this).removeClass("ondrag");
				});
			});
		}

		// ie6 png 图片透明
		// 将单引号中的内容修改为你使用了png图片的样式，与 CSS 文件中一样即可
		// 如果要直接插入 png 图片，在单引号内加入 img 即可
		if(isIE6) {
			//$.getScript("/statics/js/DD_belatedPNG.js", function(){
				//DD_belatedPNG.fix('img');
			//});
			// 让IE6 缓存背景图片
			/* TredoSoft Multiple IE doesn't like this, so try{} it */
			try {
				document.execCommand("BackgroundImageCache", false, true);
			} catch(r) {}
		}
	});
})(jQuery);