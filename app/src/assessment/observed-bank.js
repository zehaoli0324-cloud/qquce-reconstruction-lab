import payload from "../../../data/observed/mbti-type-test.questions.json" with { type: "json" };
import source from "../../../data/observed/source.json" with { type: "json" };

const pairs = [
  ["EI", "外向 / 内向", "E", "I"],
  ["SN", "感觉 / 直觉", "S", "N"],
  ["TF", "思考 / 情感", "T", "F"],
  ["JP", "判断 / 知觉", "J", "P"],
];
export const observedMbti = {
  id: "mbti-public",
  version: "2026-11-15",
  title: "MBTI 性格类型测试 · 公开原题",
  subtitle: "原站公开页面的 40 道题与选项，本地独立计分。",
  category: "公开原题",
  minutes: 10,
  type: "dichotomy",
  instructions:
    "选择更接近自己的描述。原题与选项来自公开页面；本地按 A/B 等权计数，平分显示 X。原站服务器计分与报告未验证。",
  provenance: {
    kind: "observed-authorized",
    author: "qquce.cn public interface",
    license: source.permission.license,
    observedSource: source.mbti.page,
    originalSiteMatch: true,
    notice:
      "40 道题、选项与维度来自原站公开数据；本地计分与报告为独立实现，非原站已验证规则。",
    dataSha256: source.mbti.sha256,
  },
  dimensions: pairs.map(([id, name, first, second]) => ({
    id,
    name,
    first,
    second,
    description: `本地计数：A 计入 ${first}，B 计入 ${second}，每题权重相同。`,
    low: "本次回答更多选择第二侧选项，不代表能力高低。",
    middle: "本次回答在两侧较为接近，不必强行归为单一类型。",
    high: "本次回答更多选择第一侧选项，不代表能力高低。",
  })),
  questions: payload.questions.map((q) => ({
    id: `mbti-${String(q.id).padStart(2, "0")}`,
    sourceId: q.id,
    text: q.text,
    dimension: q.dimension,
    reverse: false,
    options: [
      { id: "A", label: q.optionA, value: 1 },
      { id: "B", label: q.optionB, value: 0 },
    ],
  })),
};
