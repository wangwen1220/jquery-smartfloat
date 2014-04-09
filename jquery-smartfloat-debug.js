/*!
 * jQuery 页面滚动浮动层智能定位插件
 * smartFloat 1.3.0
 * Date: 2013-10-21
 * Author: Steven http://wangwen1220.github.io/
 *
 * 2013-10-21 v1.3.0 整理代码，编写 demo
 * 2013-08-23 v1.2.0 添加 margin 参数设置
 * 2012-10-31 v1.1.0 添加自定义元素宽度和占位元素
 * 2010-12-06 v1.0.0 看了张鑫旭的浮动层智能定位例子，有了想改成插件的冲动，于是有了此插件
 * 说明：需要注意的一点，导航的宽度必须是固定值，不能是 auto 或者 100% 因为 fixed 和 absolute 都不认识
 * 当然你也可以手动获取到导航的宽度，然后写到浮动导航样式里
 * 不过有个前提，导航原先样式里不能有 position:relative，情况可能比较多，最简单的方法还是把导航宽度定死。
 * 注意：静态流元素添加占位元素，否则当窗口高度稍大于文档高度时定位会失效
 */

(function($) {
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
        default_margin = $this.css('margin'),
        default_width = $this.css('width');

      // 默认设置
      config = $.extend({
        top: 10,
        left: offset_left,
        zindex: 999, // 此值不宜过高，要根据具体情况而定
        margin: 0, // margin 也会影响元素的定位，默认重置为 0
        width: default_width,
        placeholder: false // 若浮动元素为静态流元素，需添加占位元素，默不添加
      }, config || {});
      var top = config.top,
        left = config.left,
        zindex = config.zindex,
        margin = config.margin,
        width = config.width,
        placeholder = config.placeholder;

      // TODO: 设置占位元素
      if(placeholder) {
        var $placeholder = $('<div class="smart-float-placeholder" />').insertAfter($this);
        $placeholder.width($this.outerWidth(true)).height($this.outerHeight(true)).hide();
      }

      // 鼠标滚动事件
      $(window).scroll(function() {
        var scroll_top = $(this).scrollTop();
        if(scroll_top + top > offset_top) {
          // 显示占位元素
          placeholder && $placeholder.show();

          // 添加类来控制一些复杂的布局
          $this.addClass('smart-float');
          if(window.XMLHttpRequest) {
            $this.css({
              'position': 'fixed',
              'top': top,
              'left': left,
              'z-index': zindex,
              'margin': margin,
              'width': width
            });
          } else { // for IE6
            // IE6 不认识 position: fixed，单独用 position: absolute 模拟
            $this.css({
              'position': 'absolute',
              'top': scroll_top + top,
              'left': default_left,
              'z-index': zindex,
              'margin': margin,
              'width': width
            });
            // 防止出现抖动 - 请慎用，会替换 html 已定义的背景图
            //$('html').css({'background-image': 'url(about:blank)', 'background-attachment': 'fixed'});
          }
        } else {
          // 隐藏占位元素
          placeholder && $placeholder.hide();

          // 还原初始样式
          $this.removeClass('smart-float').css({
            'position': default_position,
            'top': default_top,
            'left': default_left,
            'z-index': default_zindex,
            'margin': default_margin,
            'width': default_width
          });
        }
      });
    });
  };
})(jQuery);