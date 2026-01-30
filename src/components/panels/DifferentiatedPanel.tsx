'use client';

import { useState, useEffect } from 'react';
import { KnowledgePoint, StudentLevel, DiagnosisQuestion, CoursePage, DiagnosisConfig, ConversationDiagnosisConfig } from '@/types';
import { useEditor } from '@/store/EditorContext';
import { ChevronLeftIcon } from '@/components/icons';

export default function DifferentiatedPanel() {
  const { courseData, editorState, dispatchCourse, dispatchEditor } = useEditor();
  const [hasUploadedDesign, setHasUploadedDesign] = useState(false);
  const [showStepPages, setShowStepPages] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // 当前绑定的页面ID（用于追踪正在编辑的诊断页面）
  const [boundPageId, setBoundPageId] = useState<string | null>(null);

  // 知识点管理
  const [knowledgePoints, setKnowledgePoints] = useState<KnowledgePoint[]>([
    { id: '1', name: '物质的状态' },
    { id: '2', name: '温度的概念' },
    { id: '3', name: '观察能力' },
  ]);

  // 学生分层管理
  const [studentLevels, setStudentLevels] = useState<StudentLevel[]>([
    { id: '1', name: '融会贯通', icon: '🌟', minScore: 80, maxScore: 100, colorClass: 'emerald' },
    { id: '2', name: '掌握良好', icon: '✨', minScore: 60, maxScore: 79, colorClass: 'teal' },
    { id: '3', name: '有待提升', icon: '💡', minScore: 40, maxScore: 59, colorClass: 'amber' },
    { id: '4', name: '基础薄弱', icon: '🌱', minScore: 0, maxScore: 39, colorClass: 'rose' },
  ]);

  // 试题诊断配置
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>(['medium', 'easy']);
  const [questionCounts, setQuestionCounts] = useState<Record<string, number>>({
    hard: 2,
    'medium-hard': 2,
    medium: 3,
    'medium-easy': 2,
    easy: 2,
  });

  // 对话诊断开关
  const [conversationEnabled, setConversationEnabled] = useState(false);

  // 默认对话诊断提示词
  const defaultConversationPrompt = `# 角色设定
你是一位专业的学科教师，正在与学生进行一对一的认知诊断对话。你的目标是通过自然的对话方式，深入了解学生对知识点的理解程度。

# 交流风格
- 使用亲切友好的语气
- 适当使用鼓励性语言
- 根据学生回答调整问题难度

# 评分标准
- 严格按照知识点掌握程度评分
- 考虑学生的思维过程
- 给予建设性反馈

# 反馈方式
- 及时给予正面反馈
- 错误时引导而非直接纠正
- 总结学生的优势和待提升点

# 对话引导规则
1. 从简单问题开始，逐步深入
2. 根据学生回答动态调整问题
3. 鼓励学生表达自己的思考过程
4. 适时总结和确认理解

# 评分标准详细
- 90-100分：完全掌握，能够灵活运用
- 70-89分：基本掌握，有小部分理解偏差
- 50-69分：部分掌握，需要进一步学习
- 0-49分：掌握不足，需要重点辅导

# 反馈生成规则
- 针对每个知识点给出具体评价
- 提供个性化学习建议
- 指出需要加强的方向`;

  // 处理对话诊断开关变化
  const handleConversationToggle = (enabled: boolean) => {
    setConversationEnabled(enabled);

    if (enabled) {
      // 检查是否已有试题诊断页面
      const diagnosisPage = courseData.pages.find(p => p.type === 'diagnosis');
      if (!diagnosisPage) {
        alert('请先生成试题诊断页面');
        setConversationEnabled(false);
        return;
      }

      // 检查是否已存在对话诊断页面（包括隐藏的）
      const existingConvPage = courseData.pages.find(p => p.type === 'conversation-diagnosis');
      if (existingConvPage) {
        // 已存在，显示该页面（取消隐藏）
        if (existingConvPage.hidden) {
          const updatedPage: CoursePage = {
            ...existingConvPage,
            hidden: false,
          };
          dispatchCourse({ type: 'UPDATE_PAGE', payload: updatedPage });
        }
        dispatchEditor({ type: 'SELECT_PAGE', payload: existingConvPage.id });
        return;
      }

      // 创建对话诊断页面
      const defaultConfig: ConversationDiagnosisConfig = {
        aiRole: '专业学科教师',
        dialogueStyle: 'friendly',
        scoringPreference: 'moderate',
        encouragementStyle: 'moderate',
        maxRounds: 5,
        specialFocus: '',
        customPrompt: defaultConversationPrompt,
        isAdvancedMode: false,
      };

      const newPage: CoursePage = {
        id: `conversation-diagnosis-${Date.now()}`,
        title: '因材施教-对话诊断',
        type: 'conversation-diagnosis',
        elements: [],
        order: diagnosisPage.order + 1,
        hidden: false,
        conversationDiagnosisData: {
          config: defaultConfig,
          linkedDiagnosisPageId: diagnosisPage.id,
        }
      };

      // 添加页面
      dispatchCourse({ type: 'ADD_PAGE', payload: newPage });

      // 选中新页面
      dispatchEditor({ type: 'SELECT_PAGE', payload: newPage.id });
    } else {
      // 关闭时隐藏对话诊断页面（保留配置）
      const convPage = courseData.pages.find(p => p.type === 'conversation-diagnosis');
      if (convPage && !convPage.hidden) {
        const updatedPage: CoursePage = {
          ...convPage,
          hidden: true,
        };
        dispatchCourse({ type: 'UPDATE_PAGE', payload: updatedPage });
        // 如果当前选中的是对话诊断页面，取消选中
        if (editorState.selectedPage === convPage.id) {
          dispatchEditor({ type: 'SELECT_PAGE', payload: null });
        }
      }
    }
  };

  // 当前编辑的等级ID
  const [editingLevelId, setEditingLevelId] = useState<string | null>(null);

  // 监听选中页面变化，加载对应配置
  useEffect(() => {
    if (!editorState.selectedPage) {
      // 没有选中页面时，清除绑定
      setBoundPageId(null);
      return;
    }

    const selectedPage = courseData.pages.find(p => p.id === editorState.selectedPage);

    // 如果选中的不是诊断页面，清除绑定
    if (!selectedPage || selectedPage.type !== 'diagnosis') {
      setBoundPageId(null);
      return;
    }

    // 如果选中的诊断页面没有配置数据，也清除绑定
    if (!selectedPage.diagnosisData?.config) {
      setBoundPageId(null);
      return;
    }

    // 自动切换到因材施教面板
    if (editorState.activePanel !== 'differentiated') {
      dispatchEditor({ type: 'SET_ACTIVE_PANEL', payload: 'differentiated' });
    }

    // 加载页面配置到侧边栏
    const config = selectedPage.diagnosisData.config;
    setKnowledgePoints(config.knowledgePoints);
    setStudentLevels(config.studentLevels);
    setSelectedDifficulties(config.selectedDifficulties);
    setQuestionCounts(config.questionCounts);
    setConversationEnabled(config.conversationEnabled);
    setBoundPageId(selectedPage.id);
    setShowStepPages(true);
    setCurrentStep(1);
  }, [editorState.selectedPage, courseData.pages]);

  // 上传教学设计
  const handleUploadDesign = () => {
    setHasUploadedDesign(true);
    setShowStepPages(true);
  };

  // 跳过上传
  const handleSkipUpload = () => {
    setHasUploadedDesign(false);
    setShowStepPages(true);
  };

  // 重置因材施教
  const handleReset = () => {
    if (!confirm('确定要重置因材施教吗？这将删除所有相关页面和配置。')) {
      return;
    }
    setHasUploadedDesign(false);
    setShowStepPages(false);
    setCurrentStep(1);
    setKnowledgePoints([
      { id: '1', name: '物质的状态' },
      { id: '2', name: '温度的概念' },
      { id: '3', name: '观察能力' },
    ]);
    setConversationEnabled(false);
  };

  // 添加知识点
  const handleAddKnowledgePoint = () => {
    const newPoint: KnowledgePoint = {
      id: Date.now().toString(),
      name: '',
    };
    setKnowledgePoints([...knowledgePoints, newPoint]);
  };

  // 删除知识点
  const handleDeleteKnowledgePoint = (id: string) => {
    setKnowledgePoints(knowledgePoints.filter(point => point.id !== id));
  };

  // 更新知识点名称
  const handleUpdateKnowledgePoint = (id: string, name: string) => {
    setKnowledgePoints(knowledgePoints.map(point =>
      point.id === id ? { ...point, name } : point
    ));
  };

  // 添加等级
  const handleAddLevel = () => {
    const newLevel: StudentLevel = {
      id: Date.now().toString(),
      name: '新等级',
      icon: '⭐',
      minScore: 0,
      maxScore: 100,
      colorClass: 'gray',
    };
    setStudentLevels([...studentLevels, newLevel]);
  };

  // 删除等级
  const handleDeleteLevel = (id: string) => {
    setStudentLevels(studentLevels.filter(level => level.id !== id));
  };

  // 更新等级
  const handleUpdateLevel = (id: string, updates: Partial<StudentLevel>) => {
    setStudentLevels(studentLevels.map(level =>
      level.id === id ? { ...level, ...updates } : level
    ));
  };

  // 模拟题目数据（只保留单选题、多选题、判断题）
  const mockQuestions = [
    // 难题
    {
      id: 'q1',
      type: 'single',
      difficulty: 'hard',
      knowledgePoint: '物质的状态',
      content: '在相同温度和压强下，下列物质中分子间距离最大的是？',
      options: ['A. 固态冰', 'B. 液态水', 'C. 水蒸气', 'D. 都相同'],
      answer: 'C',
      analysis: '气体分子间距离远大于液体和固体，因此水蒸气的分子间距离最大。'
    },
    {
      id: 'q2',
      type: 'multiple',
      difficulty: 'hard',
      knowledgePoint: '温度的概念',
      content: '关于温度，下列说法正确的是？（多选）',
      options: ['A. 温度是物体冷热程度的量度', 'B. 温度越高，分子运动越剧烈', 'C. 0℃是最低温度', 'D. 温度可以用温度计测量'],
      answer: ['A', 'B', 'D'],
      analysis: '温度是物体冷热程度的量度，反映分子热运动的剧烈程度。绝对零度（-273.15℃）是理论上的最低温度。'
    },
    // 较难题
    {
      id: 'q3',
      type: 'single',
      difficulty: 'medium-hard',
      knowledgePoint: '物质的状态',
      content: '下列现象中，属于液化现象的是？',
      options: ['A. 冰雪融化', 'B. 露珠形成', 'C. 湿衣服晾干', 'D. 冰块升华'],
      answer: 'B',
      analysis: '液化是气体变为液体的过程。露珠是空气中的水蒸气遇冷液化形成的。'
    },
    {
      id: 'q4',
      type: 'judge',
      difficulty: 'medium-hard',
      knowledgePoint: '温度的概念',
      content: '常用的温度计是根据液体热胀冷缩的性质制成的。',
      options: ['A. 对', 'B. 错'],
      answer: 'A',
      analysis: '温度计利用液体热胀冷缩的性质，通过液柱高度变化来指示温度。'
    },
    // 中等题
    {
      id: 'q5',
      type: 'single',
      difficulty: 'medium',
      knowledgePoint: '物质的状态',
      content: '物质通常有三种状态，它们是？',
      options: ['A. 固态、液态、气态', 'B. 冰、水、水蒸气', 'C. 硬的、软的、流动的', 'D. 冷的、热的、温的'],
      answer: 'A',
      analysis: '物质的三种基本状态是固态、液态和气态。'
    },
    {
      id: 'q6',
      type: 'judge',
      difficulty: 'medium',
      knowledgePoint: '温度的概念',
      content: '温度计测量温度时，玻璃泡要完全浸入被测液体中，不能碰到容器底或容器壁。',
      options: ['A. 对', 'B. 错'],
      answer: 'A',
      analysis: '这是使用温度计的正确方法，可以确保测量结果准确。'
    },
    // 较易题
    {
      id: 'q7',
      type: 'single',
      difficulty: 'medium-easy',
      knowledgePoint: '物质的状态',
      content: '下列物质中，属于固态的是？',
      options: ['A. 空气', 'B. 水', 'C. 冰', 'D. 水蒸气'],
      answer: 'C',
      analysis: '冰是水的固态形式，具有固定的形状和体积。'
    },
    {
      id: 'q8',
      type: 'judge',
      difficulty: 'medium-easy',
      knowledgePoint: '物质的状态',
      content: '水蒸气是看不见的，我们看到的"白气"其实是小水滴。',
      options: ['A. 对', 'B. 错'],
      answer: 'A',
      analysis: '水蒸气是无色透明的气体，肉眼看不见。我们看到的"白气"是水蒸气遇冷液化形成的小水滴。'
    },
    // 易题
    {
      id: 'q9',
      type: 'single',
      difficulty: 'easy',
      knowledgePoint: '物质的状态',
      content: '水在常温下是什么状态？',
      options: ['A. 固态', 'B. 液态', 'C. 气态', 'D. 不确定'],
      answer: 'B',
      analysis: '常温（约20℃）下，水呈液态。'
    },
    {
      id: 'q10',
      type: 'judge',
      difficulty: 'easy',
      knowledgePoint: '温度的概念',
      content: '温度计可以用来测量物体的温度。',
      options: ['A. 对', 'B. 错'],
      answer: 'A',
      analysis: '温度计是专门用来测量温度的仪器。'
    },
    {
      id: 'q11',
      type: 'multiple',
      difficulty: 'easy',
      knowledgePoint: '物质的状态',
      content: '下列哪些是水的存在形式？（多选）',
      options: ['A. 冰', 'B. 液态水', 'C. 水蒸气', 'D. 石头'],
      answer: ['A', 'B', 'C'],
      analysis: '水可以以固态（冰）、液态（水）、气态（水蒸气）三种形式存在。'
    },
    {
      id: 'q12',
      type: 'single',
      difficulty: 'easy',
      knowledgePoint: '温度的概念',
      content: '下列哪个温度最高？',
      options: ['A. 0℃', 'B. 10℃', 'C. 20℃', 'D. -5℃'],
      answer: 'C',
      analysis: '在这些温度中，20℃最高。'
    }
  ];

  // 生成测试页面
  const handleGenerateTestPage = () => {
    // 根据选择的难度和数量筛选题目
    const selectedQuestions: DiagnosisQuestion[] = [];
    selectedDifficulties.forEach(difficulty => {
      const count = questionCounts[difficulty] || 0;
      const availableQuestions = mockQuestions.filter(q => q.difficulty === difficulty);
      const selected = availableQuestions.slice(0, Math.min(count, availableQuestions.length));
      selectedQuestions.push(...selected as DiagnosisQuestion[]);
    });

    if (selectedQuestions.length === 0) {
      alert('请先选择难度并配置题目数量');
      return;
    }

    // 构建配置对象
    const config: DiagnosisConfig = {
      knowledgePoints,
      studentLevels,
      selectedDifficulties,
      questionCounts,
      conversationEnabled,
    };

    // 如果已绑定页面，更新该页面；否则创建新页面
    if (boundPageId) {
      const existingPage = courseData.pages.find(p => p.id === boundPageId);
      if (existingPage) {
        const updatedPage: CoursePage = {
          ...existingPage,
          diagnosisData: {
            questions: selectedQuestions,
            knowledgePoints: knowledgePoints.map(kp => kp.name),
            config,
          }
        };
        dispatchCourse({ type: 'UPDATE_PAGE', payload: updatedPage });
        return;
      }
    }

    // 创建新的诊断页面
    const newPage: CoursePage = {
      id: `diagnosis-${Date.now()}`,
      title: '因材施教-试题诊断',
      type: 'diagnosis',
      elements: [],
      order: courseData.pages.length,
      diagnosisData: {
        questions: selectedQuestions,
        knowledgePoints: knowledgePoints.map(kp => kp.name),
        config,
      }
    };

    // 添加页面到课程
    dispatchCourse({ type: 'ADD_PAGE', payload: newPage });

    // 选中新创建的页面并绑定
    dispatchEditor({ type: 'SELECT_PAGE', payload: newPage.id });
    setBoundPageId(newPage.id);
  };

  // 导航
  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    }
  };

  return (
    <div className="w-[320px] bg-white border-l border-gray-200 flex flex-col h-full">
      {/* 面板头部 */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold text-gray-900">因材施教</span>
          <button
            onClick={handleReset}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
            title="重置"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
              <path d="M21 3v5h-5"/>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
              <path d="M3 21v-5h5"/>
            </svg>
          </button>
        </div>
        <button
          onClick={() => dispatchEditor({ type: 'TOGGLE_PANEL_COLLAPSE' })}
          className="w-7 h-7 rounded-lg border-none bg-transparent cursor-pointer flex items-center justify-center transition-all text-gray-400 hover:bg-gray-100 hover:text-gray-500"
          title="收起面板"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </button>
      </div>

      {/* 面板内容 */}
      <div className="flex-1 overflow-y-auto">
        {!showStepPages ? (
          // 入口选择区域
          <div className="p-5 space-y-3">
            <button
              onClick={handleSkipUpload}
              className="w-full bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors text-left"
            >
              <div className="flex items-start gap-3">
                <span className="text-xl">✨</span>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900">创建空白</div>
                  <div className="text-xs text-gray-500">从零开始配置因材施教方案</div>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
            <button
              onClick={() => alert('正在开发中')}
              className="w-full bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors text-left"
            >
              <div className="flex items-start gap-3">
                <span className="text-xl">📂</span>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900">从资源库导入</div>
                  <div className="text-xs text-gray-500">导入已有的教学设计方案</div>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>
        ) : (
          // 步骤页面区域
          <div className="flex flex-col h-full">
            {currentStep === 1 ? (
              // 第一步：认知起点诊断
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <button
                    onClick={() => setShowStepPages(false)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="15 18 9 12 15 6"/>
                    </svg>
                  </button>
                  <h2 className="text-lg font-bold text-gray-900">认知起点诊断</h2>
                </div>

                {/* 1. 诊断知识点 */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-start gap-2 mb-3">
                    <span className="text-xl">📚</span>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">诊断知识点</div>
                      <div className="text-xs text-gray-500">输入要考察的知识点</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {knowledgePoints.map((point) => (
                      <div key={point.id} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={point.name}
                          onChange={(e) => handleUpdateKnowledgePoint(point.id, e.target.value)}
                          placeholder="输入知识点名称"
                          className="flex-1 h-9 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <button
                          onClick={() => handleDeleteKnowledgePoint(point.id)}
                          className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleAddKnowledgePoint}
                    className="mt-3 text-sm text-emerald-600 font-medium hover:text-emerald-700"
                  >
                    + 添加知识点
                  </button>
                </div>

                {/* 2. 认知起点分层 */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-start gap-2 mb-3">
                    <span className="text-xl">🏷️</span>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">认知起点分层</div>
                      <div className="text-xs text-gray-500">配置分层等级和分数段</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {studentLevels.map((level) => {
                      const isEditing = editingLevelId === level.id;
                      return (
                        <div
                          key={level.id}
                          className={`rounded-lg p-3 transition-all cursor-pointer ${
                            isEditing
                              ? 'bg-emerald-50 shadow-sm'
                              : 'hover:bg-gray-100'
                          }`}
                          onClick={() => setEditingLevelId(level.id)}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{level.icon}</span>
                            <input
                              type="text"
                              value={level.name}
                              onChange={(e) => handleUpdateLevel(level.id, { name: e.target.value })}
                              onFocus={() => setEditingLevelId(level.id)}
                              className="flex-1 h-8 px-2 rounded border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={level.minScore}
                              onChange={(e) => handleUpdateLevel(level.id, { minScore: parseInt(e.target.value) })}
                              onFocus={() => setEditingLevelId(level.id)}
                              min="0"
                              max="100"
                              className="w-16 h-8 px-2 rounded border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                            <span className="text-sm text-gray-600">-</span>
                            <input
                              type="number"
                              value={level.maxScore}
                              onChange={(e) => handleUpdateLevel(level.id, { maxScore: parseInt(e.target.value) })}
                              onFocus={() => setEditingLevelId(level.id)}
                              min="0"
                              max="100"
                              className="w-16 h-8 px-2 rounded border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                            <span className="text-sm text-gray-600">分</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteLevel(level.id);
                              }}
                              className="ml-auto p-1 rounded hover:bg-gray-200 transition-colors"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    onClick={handleAddLevel}
                    className="mt-3 text-sm text-emerald-600 font-medium hover:text-emerald-700"
                  >
                    + 添加等级
                  </button>
                </div>

                {/* 3. 试题诊断 */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-start gap-2 mb-3">
                    <span className="text-xl">📝</span>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">试题诊断</div>
                      <div className="text-xs text-gray-500">选择难度并配置题目数量</div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 mb-3 space-y-3">
                    {/* 难度标签选择 */}
                    <div>
                      <div className="text-xs text-gray-600 mb-2">题目难度</div>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { id: 'hard', name: '难' },
                          { id: 'medium-hard', name: '较难' },
                          { id: 'medium', name: '中等' },
                          { id: 'medium-easy', name: '较易' },
                          { id: 'easy', name: '易' }
                        ].map(level => {
                          const isSelected = selectedDifficulties.includes(level.id);
                          return (
                            <button
                              key={level.id}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedDifficulties(prev => prev.filter(d => d !== level.id));
                                } else {
                                  setSelectedDifficulties(prev => [...prev, level.id]);
                                }
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                isSelected
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {level.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    {/* 题目数量配置 */}
                    {selectedDifficulties.length > 0 && (
                      <div>
                        <div className="text-xs text-gray-600 mb-2">题目数量</div>
                        <div className="space-y-2">
                          {selectedDifficulties.map(diffId => {
                            const diffNames: Record<string, string> = {
                              'hard': '难',
                              'medium-hard': '较难',
                              'medium': '中等',
                              'medium-easy': '较易',
                              'easy': '易'
                            };
                            const diffName = diffNames[diffId] || diffId;
                            return (
                              <div key={diffId} className="flex items-center gap-2">
                                <span className="text-xs text-gray-600 w-10 shrink-0">{diffName}:</span>
                                <input
                                  type="number"
                                  value={questionCounts[diffId] || 0}
                                  onChange={(e) => setQuestionCounts(prev => ({
                                    ...prev,
                                    [diffId]: Math.max(0, parseInt(e.target.value) || 0)
                                  }))}
                                  min="0"
                                  className="flex-1 h-8 px-2 rounded border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                                <span className="text-xs text-gray-600 shrink-0">题</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleGenerateTestPage}
                    className="w-full h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold hover:from-emerald-600 hover:to-teal-600 transition-colors"
                  >
                    {boundPageId ? '更新页面' : '生成页面'}
                  </button>
                </div>

                {/* 4. 对话诊断 */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <span className="text-xl">💬</span>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">对话诊断</div>
                      <div className="text-xs text-gray-500">基于答题情况进一步评估认知</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={conversationEnabled}
                        onChange={(e) => handleConversationToggle(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                  <p className="mt-3 text-sm text-gray-600">开启后将自动创建对话诊断页面</p>
                </div>
              </div>
            ) : (
              // 第二步：分层教学
              <div className="flex-1 overflow-y-auto p-5">
                <h2 className="text-lg font-bold text-gray-900 mb-4">分层教学</h2>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-600">根据诊断结果，为不同层次学生设计差异化教学内容。</p>
                </div>
              </div>
            )}

            {/* 导航按钮 */}
            <div className="flex items-center justify-between p-5 border-t border-gray-200">
              {currentStep > 1 && (
                <button
                  onClick={handlePreviousStep}
                  className="flex items-center gap-2 h-10 px-4 rounded-xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                  上一步
                </button>
              )}
              {currentStep === 1 && (
                <button
                  onClick={handleNextStep}
                  className="ml-auto flex items-center gap-2 h-10 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold hover:from-emerald-600 hover:to-teal-600 transition-colors"
                >
                  下一步
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
