/*global jQuery*/

var setupPhotos = (function ($) {
    function each (items, callback) {
        var i;
        for (i = 0; i < items.length; i += 1) {
            setTimeout(callback.bind(this, items[i]), 0);
        }
    }

    function flatten (items) {
        return items.reduce(function (a, b) {
            return a.concat(b);
        });
    }

    function loadPhotosByTag (tag, max, callback) {
        var photos = [];
        var callback_name = 'callback_' + Math.floor(Math.random() * 100000);

        window[callback_name] = function (data) {
            delete window[callback_name];
            var i;
            for (i = 0; i < max; i += 1) {
                photos.push(data.items[i].media.m);
            }
            callback(null, photos);
        };

        $.ajax({
            url: 'http://api.flickr.com/services/feeds/photos_public.gne',
            data: {
                tags: tag,
                lang: 'en-us',
                format: 'json',
                jsoncallback: callback_name
            },
            dataType: 'jsonp'
        });
    }

    function loadAllPhotos (tags, max, callback) {
        var results = [];
        function handleResult (err, photos) {
            if (err) { return callback(err); }

            results.push(photos);
            if (results.length === tags.length) {
                callback(null, flatten(results));
            }
        }

        each(tags, function (tag) {
            loadPhotosByTag(tag, max, handleResult);
        });
    }

    function renderPhoto (photo) {
        var img = new Image();
        img.src = photo;
        return img;
    }

    function imageAppender (id) {
        var holder = document.getElementById(id);
        return function (img) {
            var elm = document.createElement('div');
            elm.className = 'photo';
            elm.appendChild(img);
            holder.appendChild(elm);
            var a = img.src.split('/');
            favHeart(elm, a.pop()+ '-' +a.pop());
        };
    }
    
    function favHeart(elm, rel)
    {
        var heart = document.createElement('span');
        if(findInFav(rel))
        {
            heart.className = 'icon-heart';
        }
        else
        {
            heart.className = 'icon-heart-empty';
        }
        heart.setAttribute('rel', rel);
        elm.appendChild(heart);
        heart.addEventListener('click', dispatchClick);
    }
    
    function dispatchClick(e)
    {
        var o = e.target;
        switch(o.className)
        {
            case 'icon-heart': 
                removeFromFav(e);
            break;
            case 'icon-heart-empty': 
                addToFav(e);
            break;
        }
    }
    
    function addToFav(e)
    {
        var o = e.target;
        o.className = 'icon-heart';
        var rel = o.getAttribute('rel');
        
        if(findInFav(rel)) return;
        
        var f = getCookie('fav');
        if(!f)
        {
            f = '';
        }
        f = f + '|' + rel;
        setCookie('fav', f);
    }
    
    function removeFromFav(e)
    {
        var o = e.target;
        o.className = 'icon-heart-empty';
        var rel = o.getAttribute('rel');
        var f = getCookie('fav');
        if(!f)
        {
            return;
        }
        var t;
        if(t = findInFav(rel))
        {
            setCookie('fav', f.replace( '|' + t, '' ));
        }
    }
    
    function findInFav(e)
    {
        var f = getCookie('fav');
        if(!f)
        {
            return false;
        }
        var a = f.split('|');
        for(var i in a)
        {
            if(a[i] == e)
            {
                return a[i];
            }
        }
    }
    
    function setCookie(c_name, value)
    {
        var expdate = new Date();
        expdate.setDate(expdate.getDate() + 1);
        var c_value = escape(value) + "; expires="+expdate.toUTCString();
        document.cookie=c_name + "=" + c_value;
    }
    
    function getCookie(c_name)
    {
        var i,x,y,ARRcookies=document.cookie.split(";");
        for (i=0;i<ARRcookies.length;i++)
        {
            x = ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
            y = ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
            x = x.replace(/^\s+|\s+$/g,"");
            if (x == c_name)
            {
                return unescape(y);
            }
        }
    }
    
    // ----
    
    var max_per_tag = 5;
    return function setup (tags, callback) {
        loadAllPhotos(tags, max_per_tag, function (err, items) {
            if (err) { return callback(err); }

            each(items.map(renderPhoto), imageAppender('photos'));
            callback();
        });
        
        var callback_name = 'callback_' + Math.floor(Math.random() * 100000);
    };
}(jQuery));
