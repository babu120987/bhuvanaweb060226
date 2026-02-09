var imageload = false;
$(document).ready(function(){
    iframe();
    img_intersectionobserver();
});

$( window ).resize(function() {
  iframe();
});

window.onload = function(){
    lazyload_img();
}


function homevideo_intersectionobserver(){
    console.log('home video observer Initialization');

    if(!!window.IntersectionObserver){
        const videos = document.querySelectorAll('video');
        var video_options  = {threshold: .5}
        
        const video_observer = new IntersectionObserver((entries, video_observer) => { 
            entries.forEach(entry => {
                if(!entry.isIntersecting  && !entry.target.paused && entry.target.currentTime > 0){
                    entry.target.pause(); 
                }else if(entry.isIntersecting && entry.target.currentTime > 0){
                    entry.target.play();
                }
            });
        }, video_options);
        videos.forEach(vid=>{
            video_observer.observe(vid);
        });
    }else{
        console.log('waring');
    }
}


function video_intersectionobserver(){
    console.log('video observer Initialization');

    if(!!window.IntersectionObserver){
        const videos = document.querySelectorAll('video');
        var video_options  = {threshold: .5}
        
        const video_observer = new IntersectionObserver((entries, video_observer) => { 
            entries.forEach(entry => {
                if(!entry.isIntersecting  && !entry.target.paused && entry.target.currentTime > 0){
                    entry.target.pause(); 
                }else if(entry.isIntersecting && entry.target.currentTime > 0){
                    entry.target.play();
                }else{
                    entry.target.pause();
                }
            });
        }, video_options);
        videos.forEach(vid=>{
            video_observer.observe(vid);
        });
    }else{
        console.log('waring');
    }
}

function img_intersectionobserver(){
    console.log('image observer Initialization');
    h = window.innerHeight
    w = window.innerWidth
    margin = 2*h+'px '+w+'px '
    const imgs  = document.querySelectorAll("[data-src]")

    const imgOptions={
        rootMargin: margin,
        threshold: [0]
    };
    const imgobserver = new IntersectionObserver((entries,imgobserver)=>{
        entries.forEach(entry=>{
            if(!entry.isIntersecting){
                return;
            }else{
                preloadImage(entry.target);
                imgobserver.unobserve(entry.target);
            }
        })
    },imgOptions);


    imgs.forEach(img=>{
        imgobserver.observe(img);
    });
}

function preloadImage(img){
    img.classList.add('fade-in');
    const src = img.getAttribute("data-src");
    if(!src){
        return;
    }
    img.src = src;
    img.removeAttribute("data-src");
}



function lazyload_img(){
    console.log('lazy load Initialization');
    $('img').each(function() {
        var src = $(this).attr("data-src");
        if(src!=undefined){
            $(this).attr("src",src);
        }
        $(this).removeAttr("data-src");

    });
}

$(document).on('click','.scroll-btn', function(e){
    e.preventDefault()
     $('html, body').animate({scrollTop:0}, '300');
});

$(document).on('click','.slider-btn',function(e){
    e.preventDefault();
    var id = $(this).attr('data-show');
    var slider = $(this).attr('data-slider');
    $('.slider-btn').removeClass('active');
    $(this).addClass('active');
    $('.slider-item-block').removeClass('show');
    $(id).addClass('show');
    $(slider).slick('refresh');
});

function iframe(){
    $('iframe').each(function(){
        var class_name= $(this).attr('class');
        var p_width = $(this).parent().width();
        var width = $(this).width();
        var height = $(this).height();
        if($(this).hasClass('slider') ==false){
            var resize_percentage =  p_width/width;
            var n_height = height*resize_percentage;
            $(this).attr('width',p_width);
            $(this).attr('height',n_height);
        }
    });
}

function custom_notification(message,title_txt='Notification',color=""){
    c_notification_txt = document.createElement('p');
    c_notification_txt.innerHTML = message;

    c_notification_body = document.createElement('div')
    c_notification_body.setAttribute("class","c_notification_body");
    c_notification_body.append(c_notification_txt)

    title = document.createElement('p');
    title.innerHTML = title_txt;

    closeicon = document.createElement('button');
    closeicon.setAttribute("type","button");
    closeicon.setAttribute("class","notificationclose");
    closeicon.setAttribute("aria-label","close");
    closeicon.innerHTML = '<span aria-hidden="true">&times;</span>';

    c_notification_title = document.createElement('div')
    c_notification_title.setAttribute("class","c_notification_title");
    c_notification_title.append(title,closeicon)

    if(color!=''){
        c_notification_title.setAttribute("class","c_notification_title "+color)
    }

    c_notification_block = document.createElement('div')
    c_notification_block.setAttribute("class","c_notification_block");
    c_notification_block.append(c_notification_title,c_notification_body)

    c_notification = document.createElement('div')
    c_notification.setAttribute("class","c_notification");
    c_notification.append(c_notification_block)

    $("body").append(c_notification);
    $(".c_notification").fadeIn();
    setTimeout(function(){
        $(".c_notification").fadeOut(1000,'linear',);
            setTimeout(function(){
                $('.c_notification').remove()  
            },1000);
    },3500);
}

$(document).on('click','.notificationclose',function(e){
    setTimeout(function(){
    $(".c_notification").fadeOut(1000,'linear');
    setTimeout(function(){
      $('.c_notification').remove()  
    },1000);
  },3500);
});

$(document).on('click','.createinput',function(e){
    e.preventDefault();
    var ele = document.createElement($(this).attr('data-tag'));
    ele.setAttribute('name',$(this).attr('data-name'));
    ele.setAttribute('class',$(this).attr('data-class'));
    ele.setAttribute('type',$(this).attr('data-type'));
    ele.setAttribute('placeholder',$(this).attr('data-placeholder'));
    ele.setAttribute('required',$(this).attr('data-required'));
    $(this).before(ele);
});

$(document).on('submit','form.ajax-form',function(e){
    e.preventDefault();
    $.ajax({
        url: $(this).attr('data-action'),
        type: $(this).attr('data-method'),
        data: new FormData(this),
        processData: false,
        contentType: false,
        beforeSend: function(){
            $(this).find(":submit").attr('disabled',true);
        },
        success: function (result) {
            if(result.message!=undefined){
                if(result.status=='success'){
                    custom_notification(result.message,'success','green')
                }else{
                    custom_notification(result.message,'Error','red')
                }
            }
            return false;
        }
    }).done(function(){
        $(this).trigger("reset");
        $(this).find(":submit").attr('disabled',false);
    });        
});