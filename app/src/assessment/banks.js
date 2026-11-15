import { observedMbti } from "./observed-bank.js";
// The three banks defined here are independent examples; observed data is separate.
const provenance = {
  kind: "original-demo",
  author: "Project contributors",
  license: "MIT",
  observedSource: null,
  originalSiteMatch: false,
  notice: "项目独立编写的练习题；不是原站题目，也不是经验证的心理量表。",
};
const agreement = [
  { id: "never", label: "很不符合", value: 0 },
  { id: "rarely", label: "不太符合", value: 1 },
  { id: "sometimes", label: "有些符合", value: 2 },
  { id: "often", label: "比较符合", value: 3 },
  { id: "always", label: "非常符合", value: 4 },
];
const q = (id, text, dimension, reverse = false) => ({
  id,
  text,
  dimension,
  reverse,
});
const rhythm = {
  id: "daily-rhythm",
  version: "1.0.0",
  title: "日常节奏观察",
  subtitle: "留意你安排事务、切换状态与恢复精力的习惯。",
  category: "自我观察",
  minutes: 3,
  type: "profile",
  options: agreement,
  provenance,
  instructions:
    "请结合最近一周的日常经历选择。没有标准答案，选择最接近实际的程度。",
  dimensions: [
    {
      id: "planning",
      name: "计划习惯",
      description: "提前安排、拆解事务与检查进度的习惯。",
      low: "你目前更倾向随情境安排事务。可以试着只为下一件事留一个清楚的起点。",
      middle: "你会结合情境使用计划。可以观察哪些安排确实帮助你减少临时切换。",
      high: "你经常提前安排并检查进度。可以为计划之外的变化保留一些空间。",
    },
    {
      id: "flexibility",
      name: "切换习惯",
      description: "面对变化时重新组织行动的习惯。",
      low: "你可能更喜欢稳定的安排。遇到变化时，可以先确认一件仍然能够完成的小事。",
      middle: "你有时会主动调整节奏。可以回顾一次顺利应对变化的具体做法。",
      high: "你经常能重新组织行动。可以在切换之前留意原有任务是否需要收尾。",
    },
    {
      id: "recovery",
      name: "恢复习惯",
      description: "为休息、停顿与个人时间留出空间的习惯。",
      low: "你的安排中可能较少留出恢复时间。可以尝试设置一个短暂、容易执行的停顿。",
      middle: "你有时会照顾休息需求。可以找出最容易坚持的一种恢复方式。",
      high: "你经常为恢复精力留出空间。可以继续留意休息是否符合自己的实际需要。",
    },
  ],
  questions: [
    q(
      "rhythm-01",
      "开始一天的事务前，我会先想清楚最想完成的一件事。",
      "planning",
    ),
    q("rhythm-02", "原定安排发生变化时，我能重新确定下一步。", "flexibility"),
    q("rhythm-03", "长时间投入之后，我会给自己安排短暂休息。", "recovery"),
    q("rhythm-04", "面对复杂事务时，我会把它拆成几个小步骤。", "planning"),
    q("rhythm-05", "一种做法不顺利时，我愿意试试另一种方法。", "flexibility"),
    q(
      "rhythm-06",
      "即使已经明显疲倦，我仍会连续处理不紧急的事务。",
      "recovery",
      true,
    ),
    q(
      "rhythm-07",
      "我经常做到一半才发现忘记了重要的准备事项。",
      "planning",
      true,
    ),
    q(
      "rhythm-08",
      "一项临时变化会让我很难继续处理其他事情。",
      "flexibility",
      true,
    ),
    q("rhythm-09", "我会为不被工作或学习打断的个人时间留出位置。", "recovery"),
    q("rhythm-10", "我会在合适的时候检查待办事项是否仍然必要。", "planning"),
    q("rhythm-11", "我能根据当天的精力调整任务的先后次序。", "flexibility"),
    q("rhythm-12", "我能说出一种最近确实帮助自己放松的活动。", "recovery"),
  ],
};
const collaboration = {
  id: "collaboration",
  version: "1.0.0",
  title: "协作偏好探索",
  subtitle: "观察你在共同完成事情时，如何沟通、推进与倾听。",
  category: "沟通协作",
  minutes: 3,
  type: "profile",
  options: agreement,
  provenance,
  instructions:
    "回想最近几次与他人一起做事的经历，选择最符合自己的描述。结果只用于梳理习惯。",
  dimensions: [
    {
      id: "clarity",
      name: "表达确认",
      description: "把要求说清楚、复述理解与及时同步的习惯。",
      low: "你可能较少主动确认共同理解。可以在开始之前，用一句话复述预期结果。",
      middle:
        "你有时会主动确认信息。可以找一个最常出现误解的环节，增加一次简短同步。",
      high: "你经常澄清要求并同步进展。可以继续留意沟通量是否适合当前合作。",
    },
    {
      id: "initiative",
      name: "推进参与",
      description: "提出行动、承担小任务与反馈阻碍的习惯。",
      low: "你可能更常等待明确分工。可以尝试主动认领一件边界清楚的小任务。",
      middle: "你会在一些情境下主动推进。可以回想哪些条件让你更容易行动。",
      high: "你经常主动推动事情。可以同时为其他人的意见和节奏保留空间。",
    },
    {
      id: "listening",
      name: "倾听整合",
      description: "理解不同意见并让它们进入讨论的习惯。",
      low: "你可能较快进入自己的方案。可以先问一个澄清问题，再表达建议。",
      middle: "你有时会整合不同意见。可以在讨论结束前确认哪些想法已经被考虑。",
      high: "你经常留意并整合不同意见。可以继续练习在倾听之后形成清楚的下一步。",
    },
  ],
  questions: [
    q("team-01", "收到合作任务后，我会确认彼此对完成标准的理解。", "clarity"),
    q(
      "team-02",
      "需要有人开始时，我愿意先提出一个可执行的小步骤。",
      "initiative",
    ),
    q("team-03", "听到不同意见时，我会先了解对方在担心什么。", "listening"),
    q("team-04", "任务有变化时，我会告诉受到影响的人。", "clarity"),
    q("team-05", "遇到阻碍时，我通常会一直等别人发现。", "initiative", true),
    q(
      "team-06",
      "讨论时，我常在对方说完之前就决定如何回应。",
      "listening",
      true,
    ),
    q("team-07", "我会用自己的话复述关键要求，确认没有理解偏差。", "clarity"),
    q("team-08", "我会主动承担一件自己能够负责的小任务。", "initiative"),
    q("team-09", "讨论方案时，我会邀请尚未表达的人补充意见。", "listening"),
    q("team-10", "我常以为别人自然知道我的进度和困难。", "clarity", true),
    q(
      "team-11",
      "一轮讨论之后，我愿意协助明确下一步由谁做什么。",
      "initiative",
    ),
    q("team-12", "即使不赞同，我也会试着准确概括对方的想法。", "listening"),
  ],
};
const quizQuestion = (id, text, choices, correct, explanation) => ({
  id,
  text,
  dimension: "knowledge",
  reverse: false,
  options: choices.map((label, i) => ({
    id: `choice-${i}`,
    label,
    value: i === correct ? 1 : 0,
  })),
  explanation,
});
const safety = {
  id: "digital-basics",
  version: "1.0.0",
  title: "数字安全小测",
  subtitle: "用八个日常情境，检验常见的账号与文件保护常识。",
  category: "知识练习",
  minutes: 3,
  type: "quiz",
  provenance,
  instructions:
    "每道题只有一个最佳答案。完成后可以查看每题的答案与解释。题目为项目独立编写。",
  dimensions: [
    {
      id: "knowledge",
      name: "答对题数",
      description: "8 道独立编写的知识题，每题 1 分。",
      low: "可以结合逐题解释，重新检查日常使用习惯。",
      middle: "你已掌握部分常见做法，可以关注答错题的解释。",
      high: "本次作答覆盖了较多常见做法，可以继续留意具体情境。",
    },
  ],
  questions: [
    quizQuestion(
      "safe-01",
      "收到一封要求立即输入账号密码的陌生邮件，优先怎么做？",
      [
        "直接在邮件链接中输入",
        "从自己保存的官方入口核实",
        "把验证码回复给发件人",
        "转发密码让朋友确认",
      ],
      1,
      "从已知官方入口核实，可以避免把凭据交给冒充的网站。",
    ),
    quizQuestion(
      "safe-02",
      "为不同的重要服务设置密码，哪种方式更合适？",
      [
        "所有服务使用相同短密码",
        "用公开生日作为统一密码",
        "使用密码管理器生成并保存不同密码",
        "把密码写入公开个人简介",
      ],
      2,
      "不同服务使用不同密码，有助于降低一次泄露影响多个账号的风险。",
    ),
    quizQuestion(
      "safe-03",
      "准备公开一个代码仓库，应该先检查什么？",
      [
        "是否包含 API 密钥和私人数据",
        "目录名称是否足够短",
        "是否保留了所有运行日志",
        "是否把本机凭据也上传",
      ],
      0,
      "公开前检查敏感数据，并把本地凭据排除在版本管理之外。",
    ),
    quizQuestion(
      "safe-04",
      "陌生人索要你刚收到的一次性登录验证码，应该怎么做？",
      [
        "立即告诉对方",
        "截图发到公开群聊",
        "只告诉自称客服的人",
        "不提供，并从官方入口核实",
      ],
      3,
      "验证码可能直接用于完成登录，不应交给身份未核实的人。",
    ),
    quizQuestion(
      "safe-05",
      "下载软件时，哪种做法更有助于核对来源？",
      [
        "只看文件名字",
        "优先从官方渠道下载并核对发布的校验信息",
        "随便选择一个广告下载按钮",
        "忽略系统给出的全部提示",
      ],
      1,
      "官方来源和发布方提供的校验信息，有助于确认取得的文件。",
    ),
    quizQuestion(
      "safe-06",
      "准备删除唯一的一份重要文件前，应该先做什么？",
      [
        "建立并确认可读取的备份",
        "先清空回收站",
        "只记住文件名称",
        "把文件扩展名改掉",
      ],
      0,
      "验证备份能够读取，比单纯相信已经复制过更可靠。",
    ),
    quizQuestion(
      "safe-07",
      "在共享电脑上使用自己的账号后，应如何结束使用？",
      [
        "只关闭显示器",
        "让浏览器记住密码",
        "退出账号并清理本次会话留下的私人文件",
        "把登录页面留给下个人",
      ],
      2,
      "退出账号并检查本次会话留下的私人内容，可以减少后续使用者访问的机会。",
    ),
    quizQuestion(
      "safe-08",
      "准备向应用授予权限时，哪种做法更合适？",
      [
        "一律开启全部权限",
        "把所有通讯录上传再判断",
        "只看图标是否好看",
        "根据实际功能需要授予必要权限",
      ],
      3,
      "根据实际需要授权，有助于减少与功能无关的数据访问。",
    ),
  ],
};

export const banks = [observedMbti, rhythm, collaboration, safety];
export const getBank = (id) => banks.find((bank) => bank.id === id);
