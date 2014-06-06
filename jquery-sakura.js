// Plugin code
(function ($) {
    /** Polyfills and prerequisites **/

    // requestAnimationFrame Polyfill
    var lastTime    = 0;
    var vendors     = ['webkit', 'o', 'ms', 'moz', ''];
    var vendorCount = vendors.length;

    for (var x = 0; x < vendorCount && ! window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame  = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if ( ! window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback) {
            var currTime   = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));

            var id   = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
            lastTime = currTime + timeToCall;

            return id;
        };
    }

    if ( ! window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }

    // Prefixed event Check
    $.fn.prefixedEvent = function(type, callback) {
        for (var x = 0; x < vendorCount; ++x) {
            if ( ! vendors[x]) {
                type = type.toLowerCase();
            }

            el = (this instanceof jQuery ? this[0] : this);
            el.addEventListener(vendors[x] + type, callback, false);
        }

        return this;
    };

    // Test if element is in viewport
    function elementInViewport(el) {

        if (el instanceof jQuery) {
            el = el[0];
        }

        var rect = el.getBoundingClientRect();

        return (
            rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
    }

    // Random array element
    function randomArrayElem(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    // Random integer
    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /** Actual plugin code **/
    $.fn.sakura = function (event, options) {

        // Target element
        var target = this.selector == "" ? $('body') : this;

        // Defaults for the option object, which gets extended below.
        var defaults = {
            blowAnimations: ['blow-soft-left', 'blow-medium-left', 'blow-soft-right', 'blow-medium-right'],
            className: 'sakura',
            fallSpeed: 1,
            maxSize: 14,
            minSize: 9,
            newOn: 300,
            swayAnimations: ['sway-0', 'sway-1', 'sway-2', 'sway-3', 'sway-4', 'sway-5', 'sway-6', 'sway-7', 'sway-8']
        };

        var options = $.extend({}, defaults, options);

        if (typeof event == 'undefined' || event == 'start') {

            // Declarations
            var sakura = $('<div class="' + options.className + '" />');

            // Set the overflow-x CSS property on the target element to prevent horizontal scrollbars
            target.css({ 'overflow-x': 'hidden' });

            // Function that inserts new petals into the document
            var petalCreator = function () {
                if (target.data('sakura-anim-id')) {
                    setTimeout(function () {
                        requestAnimationFrame(petalCreator);
                    }, options.newOn);
                }

                // Get one random animation of each type and randomize fall time of the petals.
                var blowAnimation = randomArrayElem(options.blowAnimations);
                var swayAnimation = randomArrayElem(options.swayAnimations);
                var fallTime = ((document.documentElement.clientHeight * 0.007) + Math.round(Math.random() * 5)) * options.fallSpeed;

                var animations =
                    'fall ' + fallTime + 's linear 0s 1' + ', ' +
                        blowAnimation + ' ' + (((fallTime > 30 ? fallTime : 30) - 20) + randomInt(0, 20)) + 's linear 0s infinite' + ', ' +
                        swayAnimation + ' ' + randomInt(2, 4) + 's linear 0s infinite';

                var petal = sakura.clone();
                var size = randomInt(options.minSize, options.maxSize);
                var startPosLeft = Math.random() * document.documentElement.clientWidth - 100;
                var startPosTop = -((Math.random() * 20) + 15);

                // Apply Event Listener to remove petals that reach the bottom of the page.
                petal.prefixedEvent('AnimationEnd', function () {
                    if (!elementInViewport(this)) {
                        $(this).remove();
                    }
                })
                // Apply Event Listener to remove petals that finish their horizontal float animation.
                .prefixedEvent('AnimationIteration', function (ev) {
                    if (
                        (
                            $.inArray(ev.animationName, options.blowAnimations) != -1 ||
                                $.inArray(ev.animationName, options.swayAnimations) != -1
                            )
                            && !elementInViewport(this)
                        ) {
                        $(this).remove();
                    }
                })
                .css({
                    '-webkit-animation': animations,
                    animation: animations,
                    height: size + 'px',
                    left: startPosLeft + 'px',
                    'margin-top': startPosTop + 'px',
                    width: size + 'px'
                });

                target.append(petal);
            };

            // Finally: Start adding petals.
            var animId = requestAnimationFrame(petalCreator);
            target.data('sakura-anim-id', animId);

        } else if (event == 'stop') {

            var animId = target.data('sakura-anim-id');

            if (animId) {
                cancelAnimationFrame(animId);
                target.data('sakura-anim-id', null);
            }

            setTimeout(function() {
                $('.' + options.className).remove();
            }, (options.newOn + 50));

        }
    };
}(jQuery));
