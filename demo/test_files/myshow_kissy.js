KISSY.use("waterfall,ajax,template,node", function(S, Waterfall, io, Template, Node) {
	var $ = Node.all,
		tpl = $('#canvas.album').length ? Template($('#albumtpl').html()) : Template($('#tpl').html()),
		islogin = $('body').hasClass('logged'),
		$canvas = $('#canvas'),
		waterfall,
		url = $canvas.attr('data-url'),
		nextpage = 1,
		initWaterfall = function(){
			waterfall = new Waterfall.Loader({
				container: "#canvas",
				adjustEffect: {
					duration: 0.6,
					easing: 'easeInStrong'
				},
				load: function(success, end) {
					$('#loading-pins').show();
					S.ajax({
					url: url,
					data: {
						//'tags': 'beauty girls',
						'page': nextpage, // 要加载的页码
						'perpage': 21 // 每页个数
					},
					dataType: "json",
					success: function(d) {
						// 如果数据错误, 则立即结束
						if (d.stat !== 'ok') {
							alert('数据加载错误!');
							end();
							return;
						}
						// 拼装每页数据
						var items = [];
						S.each(d.data, function(item) {
							//item.edit = item.edit ? 'owner' : 'disabled';
							item.admin = d.admin;
							items.push(new S.Node(tpl.render(item)));
						});
						success(items);
						// 如果到最后一页了, 也结束加载
						nextpage = d.page + 1;
						if (nextpage > d.totalpage) {
							//alert('没有更多了!');
							$('#loading-end').show('slow');
							end();
							return;
						}
					},
					complete: function() {
						$('#loading-pins').hide();
						if($('.cats-list', $canvas).length) loadCats();// 完成后执行商品页更多分类函数
						//if($('#canvas.album').length || $('#navbar .the-albums').hasClass('nowat')){
							//S.getScript("http://v3.jiathis.com/code_mini/jia.js?uid=96085");// 专辑列表加载 jiathis 代码
						//}
					}
				});
			},
			minColCount: 2, // 最小列数
			colWidth: 244 // 列宽 ＝ 1*pin + 1*margin
		});
	};
	initWaterfall(); // 页面加载时执行

	// 首页和购物页导航条
	$('#navbar a').on('click', function() {
		var $category = $('#canvas .category');
		$canvas.empty().prepend($category); // 清除除分类外的所有数据
		var $ths = $(this);
		if ($ths.hasClass('the-albums')){// 如果请求的是专辑
			tpl = Template($('#albumtpl').html());// 专辑模板
		}else{
			tpl = Template($('#tpl').html());// 分享模板
		}
		$ths.siblings().removeClass('nowat');
		$ths.addClass('nowat').parent().siblings().removeClass('selected');
		$ths.parent().addClass('selected');
		url = this.href;
		nextpage = 1;
		initWaterfall();
		return false;
	});

	// 最新、热门专辑
	$('#album-title-list a').on('click', function() {
		$canvas.empty(); // 清除数据
		url = this.href;
		nextpage = 1;
		initWaterfall();
		return false;
	});

	// 标签页－人气、最新
	$canvas.delegate('click', '#cats-nav', function(e) {
		var $category = $(e.currentTarget).parent('.category'), $ths = $(e.target);
		$ths.siblings().removeClass('selected');
		$ths.addClass('selected');
		$canvas.empty().prepend($category); // 清除除标签外的所有数据
		url = $ths.attr('href');
		nextpage = 1;
		initWaterfall();
		return false;
	});

	// 只看商品
	$canvas.delegate('change', '#cats-filter-goods', function(e) {
		var $category = $(e.currentTarget).parent('.category'), ths = e.target;
		$canvas.empty().prepend($category); // 清除除标签外的所有数据
		url = ths.checked ? ths.value : $canvas.attr('data-url');
		nextpage = 1;
		initWaterfall();
	});

	// 我的火秀－我的分享、我的喜欢
	jQuery('#header').on('click', 'a', function(){ // 点我的火秀进来显示我的分享页
		jQuery.cookie( "navid", null); // 清除 cookie
	});
	$('#pinner-nav a').on('click', function() {
		jQuery(this).addClass("current").siblings().removeClass("current");
		jQuery.cookie( "navid", this.id); // 设置 cookie
		if($(this).hasClass('.the-pin')){
			var $category = $('#canvas .ks-waterfall-fixed-left');
			$canvas.empty().prepend($category); // 清除除分类外的所有数据
			url = this.href;
			nextpage = 1;
			initWaterfall();
			return false;
		}
	});
	var cookie_nav = jQuery.cookie("navid");
	if(cookie_nav){
		$("#"+cookie_nav).fire('click');
	}

	// 搜索页
	$('#search-nav a').on('click', function() {
		var $ths = $(this), tpl_id = $ths.attr('data-tpl');
		$ths.siblings().removeClass('current');
		$ths.addClass('current');
		$canvas.empty(); // 清除数据
		tpl = Template($('#' + tpl_id).html());// 获取模板
		url = this.href;
		nextpage = 1;
		initWaterfall();
		return false;
	});

	// 展开或关闭评论
	$canvas.delegate("click", ".comment", function (event) {
		if(!islogin) return;
		var pin = $(event.currentTarget).parent(".ks-waterfall");
		$('.comment', pin).attr('title', '点击打开评论').toggleClass('opened');
		$('.opened', pin).attr('title', '点击关闭评论');
		waterfall.adjustItem(pin, {
			effect: {
				easing: "easeInStrong",
				duration: 0.1
			},
			process: function () {
				$('.comment-form', pin).toggle();
			}
		});
	});

	// 提交评论
	$canvas.delegate('submit', '.comment-form', function(event){
		var $ths = $(event.currentTarget),
			$textarea = $('textarea', $ths),
			url = $ths.attr('action'),
			data = S.trim($textarea.val()),
			$close_btn = $ths.prev('.actions').one('.comment'),
			$comment_num = $close_btn.one('strong'),
			comment_num = parseInt($comment_num.text());
		if(!data){
			alert('请输入评论内容，再提交！');
			return false;
		}else if(data.length > 300){
			alert('描述内容最长为 300 个字！');
			return false;
		}
		S.ajax({
			url: url,
			type: 'post',
			data: {"data": data},
			success: function(d){
				if(d == 1){
					$close_btn.fire('click');
					$comment_num.text(comment_num + 1);
					$textarea.val('');
				}else{
					alert('提交失败，请联系网站管理员！');
				}
			}
		});
		return false;
	});

	// 删除分享
	$canvas.delegate("click", ".del-pin", function (event) {
		var pin = $(event.currentTarget).parent(".ks-waterfall"),
			id = pin.attr('data-id'),
			uid = $('.user', pin).attr('data-uid');
		jQuery.get('/index.php?m=community&c=myhuoshow&a=system_del_share&id='+id+'&uid='+uid, function(d){
			if(d == 1){
				waterfall.removeItem(pin, {
					effect: {
						easing: "easeInStrong",
						duration: 0.3
					},
					callback: function () {
						//alert("删除完毕");
					}
				});
			}else{
				alert("删除失败，请联系管理员！");
			}
		});
	});

	// 专辑详细页评论 AJAX 提交
	$('#js-comment-form').delegate('click', 'button', function(e){
		if(!islogin) return;
		var $btn = $(e.currentTarget),
			$form = $btn.parent(),
			comment = S.trim($('textarea', $form).val()),
			url = $form.attr('action'),
			$comment_num = $('#comment-num'),
			comment_num = parseInt($comment_num.text());
		var pin = $btn.parent(".ks-waterfall");
		if(!comment) {
			alert('评论内容不能为空！');
			return false;
		}else if(comment.length > 300){
			alert('评论内容不能超过 300 字！');
			return false;
		}
		S.ajax({
			url: url,
			type: 'post',
			data: {"album_comment": comment},
			success: function(d){
				var $comment_item = jQuery('#js-comment-list .comment-item');
				waterfall.adjustItem(pin, {
					effect: {
						easing: "easeInStrong",
						duration: 0.1
					},
					process: function(){
						if($comment_item.length > 4) $(jQuery($comment_item).last()[0]).remove();
						$(d.data.comment).prependTo('#js-comment-list').hide().fadeIn(2);
						$('#pagination').html(d.data.page);
						$comment_num.text(comment_num + 1);
						$form[0].reset();
					}
				});
			},
			dataType: 'json'
		});
		return false;
	});
	// 专辑详细页评论列表 AJAX 翻页
	$('#js-comment-list').delegate('click', 'a', function(e){
		var $ths = $(e.currentTarget),
			url = $ths[0].href;
		if($ths.parent().hasClass('pagination') || $ths.hasClass('del')){
		var $comment_list = $('#js-comment-list');
		var pin = $ths.parent(".ks-waterfall");
		if($ths.hasClass('current')) return false;
		S.ajax({
			url: url,
			type: 'get',
			success: function(d){
				waterfall.adjustItem(pin, {
					effect: {
						easing: "easeInStrong",
						duration: 0.1
					},
					process: function(){
						$comment_list.html(d);
					}
				});
			}
		});
		return false;
		}
	});

	// 回到顶部
	$(window).on('scroll', function(e) {
		if($(window).scrollTop() > 300){
			$('#scroll-to-top').fadeIn(0.5);
		}else{
			$('#scroll-to-top').fadeOut(0.5);
		}
	});
	$('#scroll-to-top').on('click', function(e) {
		e.halt();
		e.preventDefault();
		$(window).stop();
		$(window).animate({
			scrollTop: 0
		},0.5,"easeOut");
	});

	// 购物页更多分类函数
	var loadCats = function(){
		var $cats_list = $('.cats-list', $canvas), $cats_pin = $cats_list.parent('.pin');
		$cats_list.delegate('click', '.load-cats', function(e){
			var $ths = $(e.currentTarget);
			var $ths_list = $ths.parent('.cats-list');
			waterfall.adjustItem($cats_pin, {
				effect: {
					easing: "easeInStrong",
					duration: 0.1
				},
				process: function (){
					if($ths.text() == '更多'){
						$('li', $ths_list).fadeIn();
						$ths.text('收起');
					}else{
						$('li', $ths_list).filter(function(e, i){return i > 14;}).hide();
						$ths.text('更多').parent().show();
					}
				}
			});
		});
	}

	// 输出调试信息
	//KISSY.Config.debug = true;
	waterfall.on('adjustComplete', function() {
		S.log('after adjust complete!');
	});
	waterfall.on('addComplete', function() {
		S.log('after add complete!');
	});
});