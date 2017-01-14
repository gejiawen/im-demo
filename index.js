/**
 * @file: index
 * @author: gejiawen
 * @date: 12/01/2017 23:49
 * @description: index
 */

$(function () {
    var props = {
        $main: $('.im-main-block'),
        $chat: $('.im-chat-block'),
        $sessions: $('.im-main-block .sessions'),
        $session: $('.im-main-block .session'),

        $chatContent: $('.im-chat-block .content.chat'),
        $settingsContent: $('.im-chat-block .content.settings'),

        $messages: $('.im-chat-block .content.chat .messages'),

        $collapseIM: $('[func="collapse-im"]'),

        $settingWindow: $('[func="setting-window"]'),
        $resizeChat: $('[func="resize-chat"]'),
        $closeChat: $('[func="close-chat"]'),

        $newChatAlert: $('[func="new-chat-alert"]'),
        $pinChat: $('[func="pin-chat"]'),
        $clearChatHistory: $('[func="clear-chat-history"]'),

        $goBackChat: $('[func="go-back-chat"]'),

        $yourMessage: $('[func="your-message"]'),
        $send: $('[func="send-message"]')
    }

    var methods = {
        init: function () {
            props.$collapseIM.on('click', function () {
                methods.collapse()
                methods.showChat(false)
            })

            props.$session.on('click', function () {
                methods.showChat(true)
                $(this).addClass('active')
                $(this).find('.count').html('0').addClass('hidden')
            })

            props.$settingWindow.on('click', function () {
                var current = $(this).attr('current')
                if (current === 'chat') {
                    methods.toggleChat('settings')
                }

                if (current === 'settings') {
                    methods.toggleChat('chat')
                }
            })

            props.$resizeChat.on('click', function () {

            })

            props.$closeChat.on('click', function () {
                methods.showChat(false)
            })

            props.$newChatAlert.on('click', function () {
                var enable = $(this).attr('enable')

                // TODO

                enable = enable === '1' ? '0' : '1'
                $(this).attr('enable', enable)

                if (enable === '1') {
                    $(this).find('.fa').removeClass('fa-square-o').addClass('fa-check-square-o')
                } else {
                    $(this).find('.fa').removeClass('fa-check-square-o').addClass('fa-square-o')
                }
            })

            props.$pinChat.on('click', function () {
                var enable = $(this).attr('enable')

                // TODO

                enable = enable === '1' ? '0' : '1'
                $(this).attr('enable', enable)

                if (enable === '1') {
                    $(this).find('.fa').removeClass('fa-square-o').addClass('fa-check-square-o')
                } else {
                    $(this).find('.fa').removeClass('fa-check-square-o').addClass('fa-square-o')
                }
            })

            props.$clearChatHistory.on('click', function () {
                if (window.confirm('你确定要清空此对话的聊天记录吗？')) {
                    // TODO
                }
            })

            props.$goBackChat.on('click', function () {
                props.$settingWindow.click()
            })

            props.$send.on('click', function () {
                var msg = props.$yourMessage.val()

                if (!msg) {
                    return
                }

                methods.genMe(msg)
                props.$yourMessage.val('')
                props.$yourMessage.css({
                    'height': 0
                });
            })

            props.$yourMessage.on('keyup', function (ev) {
                if (ev.keyCode === 13) {
                    props.$send.click()
                }

                if (!$(this).val()) {
                    $(this).css({
                        'height': 0
                    });
                }

                var scrollHeight = ev.target.scrollHeight
                console.log(scrollHeight)

                if (scrollHeight > 20) {
                    $(this).css({
                        'min-height': '20px',
                        'height': scrollHeight + 4 + 'px'
                    })
                }

                if (scrollHeight >= 100) {
                    $(this).css({
                        'max-height': '108px',
                        'height': '108px'
                    })
                }
            })

        },
        collapse: function () {
            var $brand = props.$main.find('.brand .fa')
            var $content = props.$main.find('.content')

            if ($content.hasClass('collapse')) {
                $content.removeClass('collapse')
                $brand.removeClass('fa-angle-down').addClass('fa-angle-up')
            } else {
                $content.addClass('collapse')
                $brand.removeClass('fa-angle-up').addClass('fa-angle-down')
            }
        },
        showChat: function (show) {
            props.$sessions.find('.active').removeClass('active')
            methods.toggleChat('chat')
            if (show) {
                props.$chat.removeClass('hidden')
            } else {
                props.$chat.addClass('hidden')
            }

            // TODO
        },
        toggleChat: function (flag) {
            props.$settingWindow.attr('current', flag)
            if (flag === 'chat') {
                props.$chatContent.removeClass('hidden')
                props.$settingsContent.addClass('hidden')
            }

            if (flag === 'settings') {
                props.$chatContent.addClass('hidden')
                props.$settingsContent.removeClass('hidden')
            }
        },
        genCustomer: function () {
            var markup =
                '<div class="message clearfix customer">' +
                    '<div class="fl avatar" data-username="个股公告"><img src="images/customer.png" alt=""></div>' +
                    '<div class="fl content" data-stamp="19:46">以后将提醒你持仓产品的新公告。改为提醒全部自选产品，请发送QB给我。</div>' +
                '</div>'

            props.$messages.append($(markup))
            methods.scroll2Bottom()
        },
        genMe: function (msg) {
            var markup =
                '<div class="message clearfix me">' +
                    '<div class="fr avatar"><img src="images/me.png" alt=""></div>' +
                    '<div class="fr content" data-stamp="19:47">' + msg + '</div>' +
                '</div>'

            props.$messages.append($(markup))
            methods.scroll2Bottom()
        },
        scroll2Bottom: function () {
            props.$messages.scrollTop(props.$messages.height())
        },


        utils: {

        }
    }

    methods.init()
})
