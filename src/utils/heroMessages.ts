const HERO_MESSAGE_STORAGE_KEY = 'json-xml-formatter-hero-message-queue'
const HERO_MESSAGE_LAST_KEY = 'json-xml-formatter-hero-message-last'

const HERO_OPENINGS = [
  '把乱成一团的 JSON 贴进来，',
  '遇到单行 XML 先别上火，',
  '接口返回如果像灾后现场，',
  '今天先别和括号吵架，',
  '复制进来的内容要是很野，',
  '如果这段配置看起来像谜语，',
  '当你准备开始肉眼数缩进时，',
  '这份返回值要是又长又乱，',
  '别让单行文本继续拿捏情绪，',
  '当标签全部挤成一排时，',
  '要是差异多到眼睛发酸，',
  '当表达式开始挑战耐心时，',
  '如果输出看着毫无体面，',
  '今天先给字段排个队，',
  '如果空格和换行集体失控，',
  '当你怀疑是不是该手动对齐时，',
  '如果这段数据像在闹脾气，',
  '当数组、对象和标签缠在一起时，',
  '别急着怀疑人生，',
  '这份文本要是突然不讲理，',
  '如果比对结果还没显山露水，',
  '当 Cron 表达式开始说黑话时，',
  '如果复制出来的是焦虑，',
  '当你已经开始眯眼找差异，',
  '如果今天的第一份脏数据已经到位，',
] as const

const HERO_ENDINGS = [
  '先让它排整齐再谈逻辑。',
  '剩下的体面交给这个工具箱。',
  '让缩进和换行先出来说话。',
  '至少别再让界面继续添乱。',
  '把结构捋顺以后，问题会自己冒头。',
  '先把它整理成人能看懂的样子。',
  '今天先解决排版，再解决情绪。',
  '让 JSON、XML、比对和 Cron 各归其位。',
] as const

const HERO_MESSAGES = HERO_OPENINGS.flatMap((opening) => HERO_ENDINGS.map((ending) => `${opening}${ending}`))

function shuffleMessages(messages: readonly string[]) {
  const shuffled = [...messages]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }

  return shuffled
}

export function getNextHeroMessage() {
  if (typeof window === 'undefined') {
    return HERO_MESSAGES[0]
  }

  const lastMessage = window.localStorage.getItem(HERO_MESSAGE_LAST_KEY) ?? ''
  const storedQueue = window.localStorage.getItem(HERO_MESSAGE_STORAGE_KEY)
  let queue = storedQueue ? (JSON.parse(storedQueue) as string[]) : []

  if (queue.length === 0) {
    queue = shuffleMessages(HERO_MESSAGES)

    if (queue.length > 1 && queue[0] === lastMessage) {
      ;[queue[0], queue[1]] = [queue[1], queue[0]]
    }
  }

  const [nextMessage, ...restQueue] = queue
  window.localStorage.setItem(HERO_MESSAGE_STORAGE_KEY, JSON.stringify(restQueue))
  window.localStorage.setItem(HERO_MESSAGE_LAST_KEY, nextMessage)

  return nextMessage
}
