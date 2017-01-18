/**
 * @file: index
 * @author: gejiawen
 * @date: 12/01/2017 23:49
 * @description: index
 *
 */

$(function () {
    var global = {
        ticket: null,
        mock: true,
        prefix: 'http://127.0.0.1:9999',
        urls: {
            online: {
                get_session_list: '/?m=module_g_im.im.get_chat_list',
                del_session: '/?m=module_g_im.im.delete_chat_item',
                send_msg: '/?m=module_g_im.im.send_message',
                get_message_history: '/?m=module_g_im.im.get_history_message',
                get_message_history_buy_cursor: '/?m=module_g_im.im.get_history_message',
                poll_new_msg: '/?m=module_g_im.im.get_new_message',
                search_user: '/?m=module_kaiy_account.ui_data.search_im_users'
            },
            offline: {
                get_session_list: '/mock/001_get_session_list.json',
                del_session: '/mock/002_del_session.json',
                send_msg: '/mock/003_send_msg.json',
                get_message_history: '/mock/004_get_message_history.json',
                get_message_history_buy_cursor: '/mock/004_get_message_history_buy_cursor.json',
                poll_new_msg: '/mock/005_poll_new_msg.json',
                search_user: '/mock/006_search_user.json'
            }
        },
        parse: function (key) {
            var urls = this.urls[this.mock ? 'offline' : 'online']

            if (!urls[key]) {
                alert('url key:' + url + ' do not match any rest api')
                return;
            } else {
                // return mock ? urls[key] : this.agency(urls[key], params)
                return this.prefix + urls[key]
            }
        },
        agency: function (url, params) {
            var reg = /\{([^\}]+)\}/g
            var result

            url = url.replace(reg, function (str, key) {
                result = str;
                if (key in params) {
                    result = params[key]
                } else {
                    result = ''
                }
                return result
            })

            return url
        }
    }

    var template = {
        get: function (id) {
            return $('#' + id).html()
        },
        compile: function (id, data) {
            var compiled = _.template(this.get(id))
            return compiled(data)
        },
        filters: {
            timeFormat: function (timestamp) {
                var d = new Date(timestamp)
                return d.toTimeString().slice(0, 5)
            }
        }
    }


    function dispatcher(url, params, cb) {
        $.ajax({
            type: 'GET',
            url: global.parse(url),
            data: params,
            dataType: 'json',
            success: function (rtn) {
                if (rtn && rtn.code === 0) {
                    cb && cb(rtn.data, rtn.code)
                } else {
                    console.log(rtn)
                }
            },
            error: function (xhr, type) {
                alert('ajax error')
                console.log(xhr, type)
            }
        })
    }

    var props = {
        $main: $('.im-main-block'),
        $chat: $('.im-chat-block'),
        $sessionsBlock: $('.im-main-block .sessions.list'),
        $resultBlock: $('.im-main-block .sessions.result'),
        $session: $('.im-main-block .session'),

        $chatContent: $('.im-chat-block .content.chat'),
        $settingsContent: $('.im-chat-block .content.settings'),

        $messagesBlock: $('.im-chat-block .content.chat .messages .message-wraaper'),

        $collapseIM: $('[func="collapse-im"]'),

        $settingWindow: $('[func="setting-window"]'),
        $resizeChat: $('[func="resize-chat"]'),
        $closeChat: $('[func="close-chat"]'),

        $newChatAlert: $('[func="new-chat-alert"]'),
        $pinChat: $('[func="pin-chat"]'),
        $clearChatHistory: $('[func="clear-chat-history"]'),

        $goBackChat: $('[func="go-back-chat"]'),

        $search: $('[func="search"]'),

        $yourMessage: $('[func="your-message"]'),
        $send: $('[func="send-message"]'),
        $badge: $('.im-main-block .brand .badge'),

        $getMoreMessage: $('.get-more-message')
    }

    // 从会话列表打开聊天窗口时，保存当前会话的一些基本信息
    var CURRENT_SESSION

    var methods = {
        init: function () {
            this.static_listener()

            // init ajax request
            this.request.getSessionList()
        },
        request: {
            getSessionList: function () {
                dispatcher('get_session_list', {}, function (data) {
                    var tpl = template.compile('session', {
                        sessions: data,
                        filters: template.filters
                    })
                    props.$sessionsBlock.empty().append(tpl)
                    methods.dynamic_listener()
                    methods.updateUnreadCount(data)
                })
            },
            getSearchResult: function (name) {
                dispatcher('search_user', {
                    name: name
                }, function (data) {
                    var tpl = template.compile('result', {
                        results: data,
                        filters: template.filters
                    })
                    props.$resultBlock.empty().append(tpl)
                    methods.search_user_listener()
                })
            },
            getSessionHistory: function (from_account_id, to_account_id) {
                dispatcher('get_message_history', {
                    to_account_id: to_account_id
                }, function (data) {
                    var tpl = template.compile('message', {
                        messages: data,
                        filters: template.filters,
                        from_account_id: from_account_id,
                        to_account_id: to_account_id
                    })
                    props.$messagesBlock.empty().append(tpl)

                    轮询当前聊天对话是否有新消息
                    global.ticket = setInterval(function () {
                        dispatcher('poll_new_msg', {
                            to_account_id: to_account_id
                        }, function (data) {
                            if (data.length) {
                                methods.genCustomer(data)
                            }
                        })
                    }, 4000)
                })
            },
            sendMsg: function (to_account_id, content, cb) {
                dispatcher('send_msg', {
                    to_account_id: to_account_id,
                    content: content
                }, function (data) {
                    methods.genMe(data)
                    cb && cb()
                })
            }
        },
        dynamic_listener: function () {
            // 从会话列表打开某一个聊天窗口
            props.$session = $('.im-main-block .list .session')
            props.$session.on('click', function () {
                CURRENT_SESSION = JSON.parse($(this).attr('session-info'))

                var nickname = $(this).find('.name').html()
                $('.im-chat-block .title').html(nickname)

                clearTimeout(global.ticket)
                props.$messagesBlock.empty()
                methods.showChat(true)
                $(this).addClass('active')

                var count = $(this).find('.count').html()
                var total = parseInt(props.$badge.html()) - parseInt(count)

                if (total === 0) {
                    props.$badge.hide()
                } else {
                    props.$badge.html(total)
                }

                $(this).find('.count').html('0').addClass('hidden')

                var from_account_id = $(this).attr('from-account-id')
                var to_account_id = $(this).attr('to-account-id')
                props.$chatContent.attr('to-account-id', to_account_id)

                methods.request.getSessionHistory(from_account_id, to_account_id)
            })

            props.$session.find('[func="del-session"]').on('click', function (ev) {
                ev.preventDefault()
                ev.stopPropagation()

                methods.showChat(false)
                clearInterval(global.ticket)

                if (!confirm('确定要删除此次对话吗？')) {
                    return
                }

                var to_account_id = $(this).attr('account-id')
                dispatcher('del_session', {
                    to_account_id: to_account_id
                }, function (data, code) {
                    if (code === 0) {
                        $('#session-id-' + to_account_id).remove()
                    }
                })
            })
        },
        search_user_listener: function () {
            // 从搜索结果中打开某一个聊天窗口
            props.$session = $('.im-main-block .result .session')
            props.$session.on('click', function () {
                clearTimeout(global.ticket)
                var nickname = $(this).find('.name').html()
                $('.im-chat-block .title').html(nickname)

                props.$messagesBlock.empty()
                methods.showChat(true)
                $(this).addClass('active')
                $(this).find('.count').html('0').addClass('hidden')

                // var from_account_id = $(this).attr('from-account-id')
                var to_account_id = $(this).attr('account-id')
                props.$chatContent.attr('to-account-id', to_account_id)

                // 轮询当前聊天对话是否有新消息
                global.ticket = setInterval(function () {
                    dispatcher('poll_new_msg', {
                        to_account_id: to_account_id
                    }, function (data) {
                        if (data.length) {
                            methods.genCustomer(data)
                        }
                    })
                }, 4000)

                // methods.request.getSessionHistory(from_account_id, to_account_id)
            })
        },
        static_listener: function () {
            // 会话列表展开、闭合
            props.$collapseIM.on('click', function () {
                methods.collapse()
                methods.showChat(false)
            })

            // 切换至聊天设置界面
            props.$settingWindow.on('click', function () {
                var current = $(this).attr('current')
                if (current === 'chat') {
                    methods.toggleChat('settings')
                }

                if (current === 'settings') {
                    methods.toggleChat('chat')
                }
            })

            // 切换聊天窗口的最大化、常态
            props.$resizeChat.on('click', function () {
                var $dom = $('.im-chat-block')
                if ($dom.hasClass('resize')) {
                    $dom.removeClass('resize')
                } else {
                    $dom.addClass('resize')
                }
            })

            // 关闭聊天窗口
            props.$closeChat.on('click', function () {
                methods.showChat(false)
                clearInterval(global.ticket)
            })

            // 聊天窗口设置：“新消息提醒”开关
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

            // 聊天窗口设置：“置顶聊天”开关
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

            // 聊天窗口设置：“清空聊天记录”动作
            props.$clearChatHistory.on('click', function () {
                if (window.confirm('你确定要清空此对话的聊天记录吗？')) {
                    // TODO
                }
            })

            // 从设置界面返回至聊天界面
            props.$goBackChat.on('click', function () {
                props.$settingWindow.click()
            })

            // 发送消息
            props.$send.on('click', function () {
                var msg = props.$yourMessage.val()

                if (!msg) {
                    return
                }

                methods.request.sendMsg(props.$chatContent.attr('to-account-id'), msg, function () {
                    // props.$yourMessage.val('')
                    // props.$yourMessage.css({
                    //     'height': 0
                    // });
                })

                props.$yourMessage.val('')
                props.$yourMessage.css({
                    'height': 0
                });
            })

            // 聊天消息输入监控
            // 主要是为了适配输入框的高度变化
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
                if (scrollHeight > 20) {

                    $(this).css({
                        'min-height': '20px',
                        'height': parseInt(scrollHeight / 20) * 20 + 'px'
                    })
                }

                if (scrollHeight >= 100) {
                    $(this).css({
                        'max-height': '100px',
                        'height': '100px'
                    })
                }
            })

            // 搜索框事件监控
            props.$search.on('input', function () {
                var val = $(this).val()

                methods.toggleSession(!val, val)
            })

            // 搜索框失去焦点，自动返回会话列表界面
            props.$search.on('blur', function () {
                var val = $(this).val()
                var length = props.$resultBlock.children().length

                if (val && length) {
                    // TODO
                    // 打开聊天窗口，与搜索到的用户开始聊天
                } else {
                    $(this).val('')
                    methods.toggleSession(true)
                }
            })

            // 上拉对话窗口到顶部时，拉取更多的历史记录
            $('.im-chat-block .content.chat .messages').scroll(function(ev) {
                if (ev.target.scrollTop <= 0) {
                    methods.getMoreMsg()
                }
            })

            props.$getMoreMessage.on('click', function(ev) {
                methods.getMoreMsg()
            })

        },
        getMoreMsg: function() {
            dispatcher('get_message_history_buy_cursor', {
                to_account_id: CURRENT_SESSION.last_message.to_account_id,
                cursor: CURRENT_SESSION.last_message.timestamp
            }, function (data) {
                if (data && data.length) {
                    var tpl = template.compile('message', {
                        messages: data,
                        filters: template.filters,
                        from_account_id: CURRENT_SESSION.last_message.from_account_id,
                        to_account_id: CURRENT_SESSION.last_message.to_account_id
                    })

                    props.$messagesBlock.prepend(tpl)
                } else {
                    alert('已无历史聊天数据记录')
                }
            })

        },
        updateUnreadCount: function (data) {
            var total = 0
            for (var i = 0; i < data.length; i++) {
                total += data[i].unread_count
            }
            props.$badge.html(total)
        },
        collapse: function () {
            var $brand = props.$main.find('.brand .fa')
            var $content = props.$main.find('.content')

            if ($content.hasClass('bump')) {
                $content.removeClass('bump')
                $brand.removeClass('fa-angle-down').addClass('fa-angle-up')
            } else {
                $content.addClass('bump')
                $brand.removeClass('fa-angle-up').addClass('fa-angle-down')
            }
        },
        showChat: function (show) {
            props.$sessionsBlock.find('.active').removeClass('active')
            methods.toggleChat('chat')
            if (show) {
                props.$chat.removeClass('hidden')
            } else {
                props.$chat.addClass('hidden')
            }

            // TODO
        },
        toggleSession: function (flag, input) {
            if (flag) {
                props.$sessionsBlock.removeClass('hidden')
                props.$resultBlock.addClass('hidden')
                this.request.getSessionList()
            } else {
                props.$sessionsBlock.addClass('hidden')
                props.$resultBlock.removeClass('hidden')
                this.request.getSearchResult(input)
            }
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
        genCustomer: function (data) {
            var markup = ''
            for (var i = 0; i < data.length; i++) {
                markup +=
                    '<div class="message clearfix customer" msg-id="' + data[i].msg_id + '">' +
                        '<div class="fl avatar" data-username="' + data[i].nickname + '"><img src="' + data[i].avatar + '" alt="头像"></div>' +
                        '<div class="fl content" data-stamp="' + template.filters.timeFormat(data[i].timestamp) + '">' + data[i].content + '</div>' +
                    '</div>'
            }
            // var markup =
            //     '<div class="message clearfix customer" msg-id="' + data.msg_id + '">' +
            //         '<div class="fl avatar" data-username="' + data.nickname + '"><img src="' + data.avatar + '" alt="头像"></div>' +
            //         '<div class="fl content" data-stamp="' + template.filters.timeFormat(data.timestamp) + '">' + data.content + '</div>' +
            //     '</div>'

            props.$messagesBlock.append($(markup))
            methods.scroll2Bottom()
        },
        genMe: function (data) {
            var time = template.filters.timeFormat(data.timestamp)
            var markup =
                '<div class="message clearfix me" msg-id="' + data.msg_id + '">' +
                    '<div class="fr avatar"><img src="' + data.avatar + '" alt="头像"></div>' +
                    '<div class="fr content" data-stamp="' + time + '">' + data.content + '</div>' +
                '</div>'

            props.$messagesBlock.append($(markup))
            methods.scroll2Bottom()
        },
        scroll2Top: function () {
            $('.im-chat-block .content.chat .messages').scrollTop(0)
        },
        scroll2Bottom: function () {
            $('.im-chat-block .content.chat .messages').scrollTop(props.$messagesBlock.height())
        }
    }

    // init
    methods.init()
})
