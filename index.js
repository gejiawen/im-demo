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
        $collapseIM: $('[func="collapse-im"]'),
        $session: $('.im-main-block .session'),

        $chatContent: $('.im-chat-block .content.chat'),
        $settingsContent: $('.im-chat-block .content.settings'),

        $settingWindow: $('[func="setting-window"]'),
        $resizeChat: $('[func="resize-chat"]'),
        $closeChat: $('[func="close-chat"]'),

        $newChatAlert: $('[func="new-chat-alert"]'),
        $pinChat: $('[func="pin-chat"]'),
        $clearChatHistory: $('[func="clear-chat-history"]'),

        $goBackChat: $('[func="go-back-chat"]')
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


        utils: {

        }
    }

    methods.init()
})
