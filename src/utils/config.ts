import fse from 'fs-extra'
import yaml from 'js-yaml'

import logger from './log'

/*
 * 默认配置
 */
const defaultConfig = {
    telegram: {
        token: 'YOUR_TELEGRAM_BOT_TOKEN'
    }
}

/*
 * 检测配置文件是否存在，不存在则自动创建
 */
if (!fse.existsSync('config.yaml')) {
    logger.info(`未检测到配置文件，将自动创建`)
    try {
        fse.writeFileSync('config.yaml', yaml.dump(defaultConfig))
        logger.info(`配置文件创建成功，请修改配置文件后重启服务`)
        process.exit(0)
    } catch (error) {
        logger.error(`配置文件创建失败: ${error}`)
    }
}

/*
 * 读取配置文件
 */
const config = yaml.load(fse.readFileSync('config.yaml', 'utf8')) as typeof defaultConfig

export default config
