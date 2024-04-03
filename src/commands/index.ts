import bot from '@/utils/bot'

import logger from '@/utils/log'

import config from '@/utils/config'

/*
 * 存储消息
 * 消息ID : 发送者ID
 */
const msgData = new Map<number, number>()

/*
 * 监听信息
 */
bot.on('message', async (msg) => {
    // 判断 /start 消息
    if (msg.text?.startsWith('/start')) {
        bot.sendMessage(
            msg.chat.id,
            `嗨，我是一个聊天转发机器人。你可以通过该机器人联系我的主人。请直接向我发送消息，我会将消息转发给我的主人。\n\nHi, I'm a chat forwarding bot. You can contact my owner through this bot. Please send me a message directly, and I will forward it to my owner.`
        )
        return
    }

    if (msg.from?.id !== config.owner) {
        // 生成消息内容
        const message = `接收到来自 ${msg.from?.first_name}-${
            msg.from?.last_name || ''
        } (@${msg.from?.username || '未知用户名'},${
            msg.from?.id || '未知ID'
        }) 的消息：\n\n${msg.text}`
        const forwardMsg = await bot.forwardMessage(
            config.owner,
            msg.chat.id,
            msg.message_id
        )
        // 将生成的消息内容发送给主人
        bot.sendMessage(config.owner, message)
        // 引用访客消息 需要引用
        bot.sendMessage(
            msg.chat.id,
            `这条消息已经成功发送给我的主人，他会尽快回复你。\n\nThis message has been successfully sent to my owner, and he will reply to you as soon as possible.`
        )
        msgData.set(forwardMsg.message_id, msg.from.id)
        return
    } else {
        // 判断是否为回复消息
        if (!msg.reply_to_message) {
            return bot.sendMessage(
                config.owner,
                '你是不是忘记回复啦~\n这样的话我可不会帮你把这条信息发出去哦~'
            )
        }
        // 获取回复消息的发送者ID
        const userId = msgData.get(msg.reply_to_message.message_id)

        // 判断有没有找到
        if (!userId) {
            return bot.sendMessage(config.owner, '抱歉，我找不到这条消息的发送者ID哦~')
        }
        // 只能是纯文本消息
        if (!msg.text) {
            return bot.sendMessage(
                config.owner,
                '抱歉，我只能转发文本消息哦~\nSorry, I can only forward text messages~'
            )
        }
        // 向指定用户发送消息
        try {
            bot.sendMessage(userId, `我的主人回复了你的消息：\n\n${msg.text}`)
        } catch (error) {
            logger.error('转发主人信息失败', error)
            return bot.sendMessage(config.owner, '消息发送失败，对方可能已经拉黑机器人')
        }
    }
})

/*
 * 监听错误
 */
bot.on('polling_error', (error) => {
    logger.error('polling_error', error)
})

/*
 * 监听网络错误
 */
bot.on('webhook_error', (error) => {
    logger.error('webhook_error', error)
})

/*
 * 监听其他错误
 */
bot.on('error', (error) => {
    logger.error('error', error)
})
