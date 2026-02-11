// 课时数据结构
export interface Lesson {
  id: string;
  name: string;
  chapter: string;
  order: number;
}

export interface LessonChapter {
  chapter: string;
  lessons: Lesson[];
}

// 学科列表
export const subjects = [
  '语文', '数学', '英语', '物理', '化学',
  '道德与法治', '历史', '生物', '地理'
];

// 学科图标映射
export const subjectIcons: Record<string, string> = {
  '语文': '📚', '数学': '🔢', '英语': '🌍', '物理': '⚛️', '化学': '🧪',
  '道德与法治': '⚖️', '历史': '📜', '生物': '🧬', '地理': '🌏'
};

// 年级列表
export const grades = [
  '七年级上', '七年级下', '八年级上', '八年级下', '九年级上', '九年级下'
];

// 课时数据
export const lessonData: Record<string, Record<string, LessonChapter[]>> = {
  '物理': {
    '七年级下': [
      {
        chapter: '第七章 力',
        lessons: [
          { id: 'physics-7-2-7-1', name: '7.1 力', chapter: '第七章 力', order: 1 },
          { id: 'physics-7-2-7-2', name: '7.2 弹力', chapter: '第七章 力', order: 2 },
          { id: 'physics-7-2-7-3', name: '7.3 重力', chapter: '第七章 力', order: 3 },
          { id: 'physics-7-2-7-4', name: '7.4 探究滑动摩擦力', chapter: '第七章 力', order: 4 },
        ]
      },
      {
        chapter: '第八章 运动和力',
        lessons: [
          { id: 'physics-7-2-8-1', name: '8.1 牛顿第一定律', chapter: '第八章 运动和力', order: 1 },
          { id: 'physics-7-2-8-2', name: '8.2 惯性', chapter: '第八章 运动和力', order: 2 },
          { id: 'physics-7-2-8-3', name: '8.3 二力平衡', chapter: '第八章 运动和力', order: 3 },
        ]
      },
      {
        chapter: '第九章 压强',
        lessons: [
          { id: 'physics-7-2-9-1', name: '9.1 压强', chapter: '第九章 压强', order: 1 },
          { id: 'physics-7-2-9-2', name: '9.2 液体的压强', chapter: '第九章 压强', order: 2 },
          { id: 'physics-7-2-9-3', name: '9.3 大气压强', chapter: '第九章 压强', order: 3 },
          { id: 'physics-7-2-9-4', name: '9.4 流体压强与流速的关系', chapter: '第九章 压强', order: 4 },
        ]
      },
    ],
    '七年级上': [
      {
        chapter: '第一章 走进物理世界',
        lessons: [
          { id: 'physics-7-1-1-1', name: '1.1 希望你喜爱物理', chapter: '第一章 走进物理世界', order: 1 },
          { id: 'physics-7-1-1-2', name: '1.2 学会科学探究', chapter: '第一章 走进物理世界', order: 2 },
        ]
      },
      {
        chapter: '第二章 运动的世界',
        lessons: [
          { id: 'physics-7-1-2-1', name: '2.1 动与静', chapter: '第二章 运动的世界', order: 1 },
          { id: 'physics-7-1-2-2', name: '2.2 长度与时间的测量', chapter: '第二章 运动的世界', order: 2 },
          { id: 'physics-7-1-2-3', name: '2.3 快与慢', chapter: '第二章 运动的世界', order: 3 },
        ]
      },
    ],
    '八年级上': [
      {
        chapter: '第一章 机械运动',
        lessons: [
          { id: 'physics-8-1-1-1', name: '1.1 长度和时间的测量', chapter: '第一章 机械运动', order: 1 },
          { id: 'physics-8-1-1-2', name: '1.2 运动的描述', chapter: '第一章 机械运动', order: 2 },
        ]
      },
    ],
    '八年级下': [
      {
        chapter: '第七章 力',
        lessons: [
          { id: 'physics-8-2-7-1', name: '7.1 力', chapter: '第七章 力', order: 1 },
          { id: 'physics-8-2-7-2', name: '7.2 弹力', chapter: '第七章 力', order: 2 },
          { id: 'physics-8-2-7-3', name: '7.3 重力', chapter: '第七章 力', order: 3 },
        ]
      },
    ],
    '九年级上': [
      {
        chapter: '第十三章 内能',
        lessons: [
          { id: 'physics-9-1-13-1', name: '13.1 分子热运动', chapter: '第十三章 内能', order: 1 },
          { id: 'physics-9-1-13-2', name: '13.2 内能', chapter: '第十三章 内能', order: 2 },
        ]
      },
    ],
    '九年级下': [
      {
        chapter: '第十九章 生活用电',
        lessons: [
          { id: 'physics-9-2-19-1', name: '19.1 家庭电路', chapter: '第十九章 生活用电', order: 1 },
        ]
      },
    ],
  },
  '语文': {
    '七年级上': [
      {
        chapter: '第一单元 四季如歌',
        lessons: [
          { id: 'chinese-7-1-1', name: '春', chapter: '第一单元 四季如歌', order: 1 },
          { id: 'chinese-7-1-2', name: '济南的冬天', chapter: '第一单元 四季如歌', order: 2 },
        ]
      },
    ],
  },
  '数学': {
    '七年级上': [
      {
        chapter: '第一章 有理数',
        lessons: [
          { id: 'math-7-1-1', name: '1.1 正数和负数', chapter: '第一章 有理数', order: 1 },
          { id: 'math-7-1-2', name: '1.2 有理数', chapter: '第一章 有理数', order: 2 },
        ]
      },
    ],
  },
  '英语': {
    '七年级上': [
      {
        chapter: 'Starter Unit',
        lessons: [
          { id: 'english-7-1-1', name: 'Starter Unit 1: Good morning!', chapter: 'Starter Unit', order: 1 },
        ]
      },
    ],
  },
  '化学': {
    '九年级上': [
      {
        chapter: '第一单元 走进化学世界',
        lessons: [
          { id: 'chemistry-9-1-1', name: '课题1 物质的变化和性质', chapter: '第一单元 走进化学世界', order: 1 },
        ]
      },
    ],
  },
};

// 获取指定学科和年级的课时数据
export function getLessonsBySubjectAndGrade(subject: string, grade: string): LessonChapter[] {
  return lessonData[subject]?.[grade] || [];
}
