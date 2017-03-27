//回到顶部
    $(window).scroll(function(){
        $(window).scrollTop()>0 ? $("#backTop").fadeIn(1000):$("#backTop").fadeOut(1000);  // 如果大于0 就显示 否则隐藏
        $(window).scrollTop()>0 ?  $('.bottomBtn').show() : $('.bottomBtn').hide();
    });
    $(document).on('click','#backTop',function(){
        $('body,html').animate({scrollTop:0},200);
        return false;
   });
