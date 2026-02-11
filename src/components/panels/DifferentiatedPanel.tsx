'use client';

import { useState, useEffect } from 'react';
import { KnowledgePoint, StudentLevel, DiagnosisQuestion, CoursePage, DiagnosisConfig, ConversationDiagnosisConfig, TieredTeachingPageData, TieredLevelConfig, LearningTask, TaskEvaluationCriteria, LearningPerformanceLevel, TieredAgentConfig, TieredTeachingPageData as TieredData } from '@/types';
import { useEditor } from '@/store/EditorContext';
import { ChevronLeftIcon } from '@/components/icons';
import { subjects, grades, subjectIcons, getLessonsBySubjectAndGrade, type Lesson, type LessonChapter } from '@/data/lessonData';

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

  // 分层教学相关状态
  const [tieredKnowledgePoints, setTieredKnowledgePoints] = useState<KnowledgePoint[]>([
    { id: '1', name: '力的概念' },
    { id: '2', name: '力的作用效果' },
    { id: '3', name: '力的三要素' },
  ]);
  const [boundTieredPageId, setBoundTieredPageId] = useState<string | null>(null);

  // 从资源库导入 - 三步选择流程
  const [showImportFlow, setShowImportFlow] = useState(false);
  const [importStep, setImportStep] = useState<1 | 2 | 3>(1);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [lessonChapters, setLessonChapters] = useState<LessonChapter[]>([]);
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);

  // 学习表现等级管理
  const [performanceLevels, setPerformanceLevels] = useState<LearningPerformanceLevel[]>([
    { id: 'perf-1', name: '卓越表现', icon: '🏆', color: 'emerald', minScore: 90, maxScore: 100, description: '全面完成学习任务，表现突出，能够举一反三' },
    { id: 'perf-2', name: '良好表现', icon: '⭐', color: 'blue', minScore: 75, maxScore: 89, description: '较好完成学习任务，理解深入，有一定创新' },
    { id: 'perf-3', name: '基本达标', icon: '📈', color: 'amber', minScore: 60, maxScore: 74, description: '基本完成学习任务，掌握核心内容' },
    { id: 'perf-4', name: '需要加强', icon: '💪', color: 'rose', minScore: 0, maxScore: 59, description: '学习任务完成度不足，需要额外辅导' },
  ]);
  const [editingPerformanceLevelId, setEditingPerformanceLevelId] = useState<string | null>(null);

  // 生成新的配置组ID
  const generateConfigGroupId = () => `config-group-${Date.now()}`;

  // 获取当前配置组的试题诊断页面
  const getCurrentDiagnosisPage = () => {
    if (!boundPageId) return null;
    return courseData.pages.find(p => p.id === boundPageId && p.type === 'diagnosis');
  };

  // 获取当前配置组的对话诊断页面
  const getCurrentConversationPage = () => {
    const diagnosisPage = getCurrentDiagnosisPage();
    if (!diagnosisPage?.diagnosisData?.configGroupId) return null;
    const configGroupId = diagnosisPage.diagnosisData.configGroupId;
    return courseData.pages.find(
      p => p.type === 'conversation-diagnosis' &&
      p.conversationDiagnosisData?.configGroupId === configGroupId
    );
  };

  // 计算配置组序号
  const getNextGroupIndex = () => {
    const diagnosisPages = courseData.pages.filter(p => p.type === 'diagnosis');
    const maxIndex = Math.max(0, ...diagnosisPages.map(p => p.diagnosisData?.groupIndex || 0));
    return maxIndex + 1;
  };

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
      const diagnosisPage = getCurrentDiagnosisPage();
      if (!diagnosisPage) {
        alert('请先生成试题诊断页面');
        setConversationEnabled(false);
        return;
      }

      const configGroupId = diagnosisPage.diagnosisData?.configGroupId;
      if (!configGroupId) {
        alert('配置数据异常，请重新生成试题诊断页面');
        setConversationEnabled(false);
        return;
      }

      // 检查是否已存在该配置组的对话诊断页面（包括隐藏的）
      const existingConvPage = courseData.pages.find(
        p => p.type === 'conversation-diagnosis' &&
        p.conversationDiagnosisData?.configGroupId === configGroupId
      );

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

      const groupIndex = diagnosisPage.diagnosisData?.groupIndex || 1;
      const newPage: CoursePage = {
        id: `conversation-diagnosis-${Date.now()}`,
        title: `因材施教-对话诊断${groupIndex}`,
        type: 'conversation-diagnosis',
        elements: [],
        order: diagnosisPage.order + 1,
        hidden: false,
        configGroupId,
        conversationDiagnosisData: {
          config: defaultConfig,
          linkedDiagnosisPageId: diagnosisPage.id,
          configGroupId,
        }
      };

      // 添加页面
      dispatchCourse({ type: 'ADD_PAGE', payload: newPage });

      // 选中新页面
      dispatchEditor({ type: 'SELECT_PAGE', payload: newPage.id });
    } else {
      // 关闭时隐藏对话诊断页面（保留配置）
      const convPage = getCurrentConversationPage();
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

    // 如果选中的是试题诊断页面
    if (selectedPage?.type === 'diagnosis') {
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

      // 检查该配置组是否有对话诊断页面（非隐藏）
      const configGroupId = selectedPage.diagnosisData.configGroupId;
      const hasConversationPage = courseData.pages.some(
        p => p.type === 'conversation-diagnosis' &&
        p.conversationDiagnosisData?.configGroupId === configGroupId &&
        !p.hidden
      );
      setConversationEnabled(hasConversationPage);

      setBoundPageId(selectedPage.id);
      setShowStepPages(true);
      setCurrentStep(1);
    }
    // 如果选中的是对话诊断页面
    else if (selectedPage?.type === 'conversation-diagnosis') {
      const configGroupId = selectedPage.conversationDiagnosisData?.configGroupId;
      if (!configGroupId) {
        setBoundPageId(null);
        return;
      }

      // 找到对应的试题诊断页面
      const diagnosisPage = courseData.pages.find(
        p => p.type === 'diagnosis' && p.diagnosisData?.configGroupId === configGroupId
      );

      if (diagnosisPage?.diagnosisData?.config) {
        // 自动切换到因材施教面板
        if (editorState.activePanel !== 'differentiated') {
          dispatchEditor({ type: 'SET_ACTIVE_PANEL', payload: 'differentiated' });
        }

        // 加载配置
        const config = diagnosisPage.diagnosisData.config;
        setKnowledgePoints(config.knowledgePoints);
        setStudentLevels(config.studentLevels);
        setSelectedDifficulties(config.selectedDifficulties);
        setQuestionCounts(config.questionCounts);
        setConversationEnabled(true);

        setBoundPageId(diagnosisPage.id);
        setShowStepPages(true);
        setCurrentStep(1);
      }
    }
    // 如果选中的是分层教学页面
    else if (selectedPage?.type === 'tiered-teaching') {
      const configGroupId = selectedPage.tieredTeachingData?.configGroupId;
      if (!configGroupId) {
        setBoundPageId(null);
        return;
      }

      // 找到对应的试题诊断页面
      const diagnosisPage = courseData.pages.find(
        p => p.type === 'diagnosis' && p.diagnosisData?.configGroupId === configGroupId
      );

      if (diagnosisPage?.diagnosisData?.config) {
        // 自动切换到因材施教面板
        if (editorState.activePanel !== 'differentiated') {
          dispatchEditor({ type: 'SET_ACTIVE_PANEL', payload: 'differentiated' });
        }

        // 加载配置
        const config = diagnosisPage.diagnosisData.config;
        setKnowledgePoints(config.knowledgePoints);
        setStudentLevels(config.studentLevels);
        setSelectedDifficulties(config.selectedDifficulties);
        setQuestionCounts(config.questionCounts);

        // 检查该配置组是否有对话诊断页面（非隐藏）
        const hasConversationPage = courseData.pages.some(
          p => p.type === 'conversation-diagnosis' &&
          p.conversationDiagnosisData?.configGroupId === configGroupId &&
          !p.hidden
        );
        setConversationEnabled(hasConversationPage);

        // 加载分层教学的课时知识点
        if (selectedPage.tieredTeachingData?.lessonKnowledgePoints) {
          setTieredKnowledgePoints(selectedPage.tieredTeachingData.lessonKnowledgePoints);
        }

        setBoundPageId(diagnosisPage.id);
        setBoundTieredPageId(selectedPage.id);
        setShowStepPages(true);
        setCurrentStep(2); // 直接跳转到分层教学步骤
      }
    } else {
      // 如果选中的不是因材施教相关页面，清除绑定并重置状态
      setBoundPageId(null);
      setBoundTieredPageId(null);
      setShowStepPages(false);
      setCurrentStep(1); // 重置到认知起点诊断步骤
    }
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
    setShowImportFlow(false);
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

  // 分层教学 - 添加课时知识点
  const handleAddTieredKnowledgePoint = () => {
    const newPoint: KnowledgePoint = {
      id: Date.now().toString(),
      name: '',
    };
    setTieredKnowledgePoints([...tieredKnowledgePoints, newPoint]);
  };

  // 分层教学 - 删除课时知识点
  const handleDeleteTieredKnowledgePoint = (id: string) => {
    setTieredKnowledgePoints(tieredKnowledgePoints.filter(point => point.id !== id));
  };

  // 分层教学 - 更新课时知识点
  const handleUpdateTieredKnowledgePoint = (id: string, name: string) => {
    setTieredKnowledgePoints(tieredKnowledgePoints.map(point =>
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

  // 学习表现等级 - 添加
  const handleAddPerformanceLevel = () => {
    const newLevel: LearningPerformanceLevel = {
      id: `perf-${Date.now()}`,
      name: '新等级',
      icon: '⭐',
      color: 'gray',
      minScore: 0,
      maxScore: 100,
      description: '',
    };
    setPerformanceLevels([...performanceLevels, newLevel]);
  };

  // 学习表现等级 - 删除
  const handleDeletePerformanceLevel = (id: string) => {
    setPerformanceLevels(performanceLevels.filter(level => level.id !== id));
  };

  // 学习表现等级 - 更新
  const handleUpdatePerformanceLevel = (id: string, updates: Partial<LearningPerformanceLevel>) => {
    setPerformanceLevels(performanceLevels.map(level =>
      level.id === id ? { ...level, ...updates } : level
    ));
  };

  // ===== 从资源库导入 - 处理函数 =====
  const handleStartImport = () => {
    setShowImportFlow(true);
    setImportStep(1);
    setSelectedSubject('');
    setSelectedGrade('');
    setSelectedLesson(null);
    setLessonChapters([]);
    setExpandedChapter(null);
  };

  const handleImportSelectSubject = (subject: string) => {
    setSelectedSubject(subject);
    setImportStep(2);
  };

  const handleImportSelectGrade = (grade: string) => {
    setSelectedGrade(grade);
    const chapters = getLessonsBySubjectAndGrade(selectedSubject, grade);
    setLessonChapters(chapters);
    setExpandedChapter(null);
    setImportStep(3);
  };

  const handleImportSelectLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
  };

  const handleImportBack = () => {
    if (importStep === 3) {
      setImportStep(2);
      setSelectedLesson(null);
    } else if (importStep === 2) {
      setImportStep(1);
      setSelectedGrade('');
    } else {
      setShowImportFlow(false);
    }
  };

  const toggleImportChapter = (chapter: string) => {
    setExpandedChapter(expandedChapter === chapter ? null : chapter);
  };

  // 从资源库导入 - 生成三个页面
  const handleImportGenerate = () => {
    if (!selectedSubject || !selectedGrade || !selectedLesson) return;

    const configGroupId = generateConfigGroupId();
    const groupIndex = getNextGroupIndex();
    const now = Date.now();

    // 根据选中课节预填知识点
    const lessonKPs: KnowledgePoint[] = [
      { id: `kp-${now}-1`, name: '力的概念' },
      { id: `kp-${now}-2`, name: '力的作用效果' },
      { id: `kp-${now}-3`, name: '力的三要素' },
    ];

    const diagKPs: KnowledgePoint[] = [
      { id: `dkp-${now}-1`, name: '力的定义' },
      { id: `dkp-${now}-2`, name: '力的单位' },
      { id: `dkp-${now}-3`, name: '力的示意图' },
    ];

    const levels: StudentLevel[] = [
      { id: '1', name: '融会贯通', icon: '🌟', minScore: 80, maxScore: 100, colorClass: 'emerald' },
      { id: '2', name: '掌握良好', icon: '✨', minScore: 60, maxScore: 79, colorClass: 'teal' },
      { id: '3', name: '有待提升', icon: '💡', minScore: 40, maxScore: 59, colorClass: 'amber' },
      { id: '4', name: '基础薄弱', icon: '🌱', minScore: 0, maxScore: 39, colorClass: 'rose' },
    ];

    const diagConfig: DiagnosisConfig = {
      knowledgePoints: diagKPs,
      studentLevels: levels,
      selectedDifficulties: ['hard', 'medium-hard', 'medium', 'medium-easy', 'easy'],
      questionCounts: { hard: 2, 'medium-hard': 2, medium: 3, 'medium-easy': 2, easy: 2 },
      conversationEnabled: true,
    };

    // 模拟题目（力相关）
    const forceQuestions: DiagnosisQuestion[] = [
      { id: `fq-${now}-1`, type: 'single', difficulty: 'hard', knowledgePoint: '力的概念', content: '一个物体受到两个力的作用，这两个力的三要素完全相同，则这两个力（）', options: ['A. 一定是平衡力', 'B. 一定不是平衡力', 'C. 可能是平衡力', 'D. 无法判断'], answer: 'B', analysis: '三要素完全相同意味着方向也相同，而平衡力要求方向相反，所以一定不是平衡力。' },
      { id: `fq-${now}-2`, type: 'multiple', difficulty: 'hard', knowledgePoint: '力的作用效果', content: '关于力的作用效果，下列说法正确的是？（多选）', options: ['A. 力可以改变物体的运动状态', 'B. 力可以改变物体的形状', 'C. 力的作用效果与力的大小有关', 'D. 力的作用效果与力的方向无关'], answer: ['A', 'B', 'C'], analysis: '力的作用效果包括改变运动状态和改变形状，且与力的三要素（大小、方向、作用点）都有关。' },
      { id: `fq-${now}-3`, type: 'single', difficulty: 'medium-hard', knowledgePoint: '力的三要素', content: '用力推门时，手的位置离门轴越远越容易推开，这说明力的作用效果与什么有关？', options: ['A. 力的大小', 'B. 力的方向', 'C. 力的作用点', 'D. 力的单位'], answer: 'C', analysis: '手离门轴的距离不同，即力的作用点不同，效果不同，说明力的作用效果与作用点有关。' },
      { id: `fq-${now}-4`, type: 'judge', difficulty: 'medium-hard', knowledgePoint: '力的概念', content: '一个物体也可以产生力的作用。', options: ['A. 对', 'B. 错'], answer: 'B', analysis: '力是物体对物体的作用，至少需要两个物体，一个物体不能产生力。' },
      { id: `fq-${now}-5`, type: 'single', difficulty: 'medium', knowledgePoint: '力的概念', content: '下列关于力的说法正确的是？', options: ['A. 两个物体不接触就不会有力的作用', 'B. 力可以离开物体而独立存在', 'C. 力是物体对物体的作用', 'D. 受力物体不会对施力物体产生力'], answer: 'C', analysis: '力是物体对物体的作用，不能离开物体存在，且力的作用是相互的。' },
      { id: `fq-${now}-6`, type: 'single', difficulty: 'medium', knowledgePoint: '力的单位', content: '力的国际单位是？', options: ['A. 千克', 'B. 牛顿', 'C. 帕斯卡', 'D. 焦耳'], answer: 'B', analysis: '力的国际单位是牛顿（N），简称牛。' },
      { id: `fq-${now}-7`, type: 'judge', difficulty: 'medium', knowledgePoint: '力的作用效果', content: '力的作用是相互的。', options: ['A. 对', 'B. 错'], answer: 'A', analysis: '物体间力的作用是相互的，施力物体同时也是受力物体。' },
      { id: `fq-${now}-8`, type: 'single', difficulty: 'medium-easy', knowledgePoint: '力的三要素', content: '力的三要素是指？', options: ['A. 大小、方向、作用点', 'B. 大小、速度、方向', 'C. 重力、弹力、摩擦力', 'D. 大小、单位、方向'], answer: 'A', analysis: '力的三要素是力的大小、方向和作用点。' },
      { id: `fq-${now}-9`, type: 'judge', difficulty: 'medium-easy', knowledgePoint: '力的概念', content: '磁铁能吸引铁钉，说明不接触的物体之间也可以有力的作用。', options: ['A. 对', 'B. 错'], answer: 'A', analysis: '磁力是非接触力，说明不接触的物体间也能产生力的作用。' },
      { id: `fq-${now}-10`, type: 'single', difficulty: 'easy', knowledgePoint: '力的概念', content: '下列哪个是力的作用？', options: ['A. 用手推桌子', 'B. 看书', 'C. 听音乐', 'D. 想问题'], answer: 'A', analysis: '用手推桌子是手对桌子施加了力的作用。' },
      { id: `fq-${now}-11`, type: 'judge', difficulty: 'easy', knowledgePoint: '力的单位', content: '力的单位是牛顿，简称牛，符号是N。', options: ['A. 对', 'B. 错'], answer: 'A', analysis: '力的国际单位是牛顿（Newton），简称牛，符号N。' },
    ];

    // 1. 创建试题诊断页面
    const diagnosisPageId = `diagnosis-${now}`;
    const diagnosisPage: CoursePage = {
      id: diagnosisPageId,
      title: `因材施教-试题诊断${groupIndex}`,
      type: 'diagnosis',
      elements: [],
      order: courseData.pages.length,
      configGroupId,
      diagnosisData: {
        questions: forceQuestions,
        knowledgePoints: diagKPs.map(kp => kp.name),
        config: diagConfig,
        configGroupId,
        groupIndex,
      }
    };

    // 2. 创建对话诊断页面
    const convPageId = `conversation-diagnosis-${now + 1}`;
    const convPage: CoursePage = {
      id: convPageId,
      title: `因材施教-对话诊断${groupIndex}`,
      type: 'conversation-diagnosis',
      elements: [],
      order: courseData.pages.length + 1,
      hidden: false,
      configGroupId,
      conversationDiagnosisData: {
        config: {
          aiRole: '专业物理教师',
          dialogueStyle: 'friendly',
          scoringPreference: 'moderate',
          encouragementStyle: 'moderate',
          maxRounds: 5,
          specialFocus: '重点关注学生对力的概念和力的三要素的理解',
          customPrompt: defaultConversationPrompt,
          isAdvancedMode: false,
        },
        linkedDiagnosisPageId: diagnosisPageId,
        configGroupId,
      }
    };

    // 3. 创建分层教学页面
    const tieredConfigs: TieredLevelConfig[] = levels.map(level => ({
      levelId: level.id,
      levelName: level.name,
      levelIcon: level.icon,
      levelColor: level.colorClass,
      learningTasks: getDefaultLearningTasks(level.id),
      performanceLevels: [...performanceLevels],
      agentConfig: getDefaultAgentConfig(level.id, level.name),
    }));

    const tieredPageId = `tiered-teaching-${now + 2}`;
    const tieredPage: CoursePage = {
      id: tieredPageId,
      title: `因材施教-分层教学${groupIndex}`,
      type: 'tiered-teaching',
      elements: [],
      order: courseData.pages.length + 2,
      configGroupId,
      tieredTeachingData: {
        configGroupId,
        groupIndex,
        lessonKnowledgePoints: lessonKPs,
        studentLevels: [...levels],
        tieredConfigs,
      }
    };

    // 依次添加三个页面
    dispatchCourse({ type: 'ADD_PAGE', payload: diagnosisPage });
    dispatchCourse({ type: 'ADD_PAGE', payload: convPage });
    dispatchCourse({ type: 'ADD_PAGE', payload: tieredPage });

    // 加载配置到侧边栏状态
    setKnowledgePoints(diagKPs);
    setStudentLevels(levels);
    setSelectedDifficulties(['hard', 'medium-hard', 'medium', 'medium-easy', 'easy']);
    setQuestionCounts({ hard: 2, 'medium-hard': 2, medium: 3, 'medium-easy': 2, easy: 2 });
    setConversationEnabled(true);
    setTieredKnowledgePoints(lessonKPs);

    // 选中试题诊断页面并进入配置模式
    setBoundPageId(diagnosisPageId);
    setBoundTieredPageId(tieredPageId);
    setShowImportFlow(false);
    setShowStepPages(true);
    setCurrentStep(1);
    dispatchEditor({ type: 'SELECT_PAGE', payload: diagnosisPageId });
  };
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
            configGroupId: existingPage.diagnosisData?.configGroupId || generateConfigGroupId(),
            groupIndex: existingPage.diagnosisData?.groupIndex || getNextGroupIndex(),
          }
        };
        dispatchCourse({ type: 'UPDATE_PAGE', payload: updatedPage });
        return;
      }
    }

    // 创建新的诊断页面
    const configGroupId = generateConfigGroupId();
    const groupIndex = getNextGroupIndex();

    const newPage: CoursePage = {
      id: `diagnosis-${Date.now()}`,
      title: `因材施教-试题诊断${groupIndex}`,
      type: 'diagnosis',
      elements: [],
      order: courseData.pages.length,
      configGroupId,
      diagnosisData: {
        questions: selectedQuestions,
        knowledgePoints: knowledgePoints.map(kp => kp.name),
        config,
        configGroupId,
        groupIndex,
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

  // 默认学习任务（按等级，每个任务包含评价标准）
  const getDefaultLearningTasks = (levelId: string): LearningTask[] => {
    const tasks: Record<string, LearningTask[]> = {
      '1': [ // 融会贯通
        {
          id: 'task-1-1',
          title: '挑战进阶：力的综合应用',
          description: '综合运用力的三要素分析复杂情境，尝试解决生活中的力学问题',
          evaluationCriteria: [
            { id: 'eval-1-1-1', name: '综合应用能力', description: '能够灵活运用力的概念解决复杂问题', weight: 50 },
            { id: 'eval-1-1-2', name: '分析深度', description: '能从多角度分析问题，考虑各种因素', weight: 50 }
          ]
        },
        {
          id: 'task-1-2',
          title: '拓展探究：力的相互作用',
          description: '探究牛顿第三定律的应用，分析相互作用力的特点',
          evaluationCriteria: [
            { id: 'eval-1-2-1', name: '探究能力', description: '能主动探索超出课本的知识内容', weight: 50 },
            { id: 'eval-1-2-2', name: '理论联系', description: '能将理论与实际现象联系起来', weight: 50 }
          ]
        },
        {
          id: 'task-1-3',
          title: '创意实践：设计力学小实验',
          description: '设计一个展示力的作用效果的创意实验，并记录观察结果',
          evaluationCriteria: [
            { id: 'eval-1-3-1', name: '创新思维', description: '能提出有创意的解决方案或实验设计', weight: 50 },
            { id: 'eval-1-3-2', name: '实验记录', description: '能准确记录实验过程和结果', weight: 50 }
          ]
        }
      ],
      '2': [ // 掌握良好
        {
          id: 'task-2-1',
          title: '巩固强化：力的三要素',
          description: '通过练习题巩固力的大小、方向、作用点的理解',
          evaluationCriteria: [
            { id: 'eval-2-1-1', name: '概念理解', description: '准确理解力的三要素及其作用效果', weight: 50 },
            { id: 'eval-2-1-2', name: '答题准确性', description: '能正确解答相关练习题', weight: 50 }
          ]
        },
        {
          id: 'task-2-2',
          title: '概念深化：力的作用效果',
          description: '区分力使物体形变和改变运动状态这两种效果',
          evaluationCriteria: [
            { id: 'eval-2-2-1', name: '问题解决', description: '能运用所学知识解决标准问题', weight: 50 },
            { id: 'eval-2-2-2', name: '概念区分', description: '能清晰区分不同的力的作用效果', weight: 50 }
          ]
        },
        {
          id: 'task-2-3',
          title: '实验观察：弹簧测力计的使用',
          description: '学习正确使用弹簧测力计测量力的大小',
          evaluationCriteria: [
            { id: 'eval-2-3-1', name: '实验技能', description: '能正确使用测量工具和记录数据', weight: 50 },
            { id: 'eval-2-3-2', name: '操作规范', description: '实验操作步骤规范正确', weight: 50 }
          ]
        }
      ],
      '3': [ // 有待提升
        {
          id: 'task-3-1',
          title: '基础回顾：什么是力',
          description: '复习力的定义，理解力是物体对物体的作用',
          evaluationCriteria: [
            { id: 'eval-3-1-1', name: '基础掌握', description: '理解力的基本定义和三要素', weight: 50 },
            { id: 'eval-3-1-2', name: '概念表述', description: '能用自己的话解释什么是力', weight: 50 }
          ]
        },
        {
          id: 'task-3-2',
          title: '逐步掌握：力的三要素',
          description: '通过图示和实例理解力的三要素',
          evaluationCriteria: [
            { id: 'eval-3-2-1', name: '知识应用', description: '能在简单情境中识别和分析力', weight: 50 },
            { id: 'eval-3-2-2', name: '图示理解', description: '能看懂力的示意图', weight: 50 }
          ]
        },
        {
          id: 'task-3-3',
          title: '动手体验：感受力的作用',
          description: '通过简单实验感受力可以改变物体的形状和运动状态',
          evaluationCriteria: [
            { id: 'eval-3-3-1', name: '学习态度', description: '积极参与学习活动，认真完成任务', weight: 50 },
            { id: 'eval-3-3-2', name: '体验感悟', description: '能描述实验中的感受和发现', weight: 50 }
          ]
        }
      ],
      '4': [ // 基础薄弱
        {
          id: 'task-4-1',
          title: '启蒙引导：认识力',
          description: '通过生活实例认识什么是力，建立初步概念',
          evaluationCriteria: [
            { id: 'eval-4-1-1', name: '概念建立', description: '建立对力的初步认识', weight: 50 },
            { id: 'eval-4-1-2', name: '生活联系', description: '能举出生活中力的例子', weight: 50 }
          ]
        },
        {
          id: 'task-4-2',
          title: '基础夯实：力的基本概念',
          description: '理解力必须有施力物体和受力物体',
          evaluationCriteria: [
            { id: 'eval-4-2-1', name: '学习进步', description: '相比学习前有明显进步', weight: 50 },
            { id: 'eval-4-2-2', name: '概念识别', description: '能识别施力物体和受力物体', weight: 50 }
          ]
        },
        {
          id: 'task-4-3',
          title: '循序渐进：力的作用是相互的',
          description: '通过互推、拍手等活动体验力的相互性',
          evaluationCriteria: [
            { id: 'eval-4-3-1', name: '参与度', description: '积极参与学习活动，愿意尝试', weight: 50 },
            { id: 'eval-4-3-2', name: '体验理解', description: '能通过活动理解力的相互性', weight: 50 }
          ]
        }
      ]
    };
    return tasks[levelId] || tasks['2'];
  };

  // 默认学习表现等级
  const getDefaultPerformanceLevels = (): LearningPerformanceLevel[] => [
    { id: 'perf-1', name: '卓越表现', icon: '🏆', color: 'emerald', minScore: 90, maxScore: 100, description: '全面完成学习任务，表现突出，能够举一反三' },
    { id: 'perf-2', name: '良好表现', icon: '⭐', color: 'blue', minScore: 75, maxScore: 89, description: '较好完成学习任务，理解深入，有一定创新' },
    { id: 'perf-3', name: '基本达标', icon: '📈', color: 'amber', minScore: 60, maxScore: 74, description: '基本完成学习任务，掌握核心内容' },
    { id: 'perf-4', name: '需要加强', icon: '💪', color: 'rose', minScore: 0, maxScore: 59, description: '学习任务完成度不足，需要额外辅导' },
  ];

  // 默认智能体配置（按等级）
  const getDefaultAgentConfig = (levelId: string, levelName: string): TieredAgentConfig => {
    const configs: Record<string, TieredAgentConfig> = {
      '1': {
        name: '探索导师',
        role: '引导学生进行深度探究和创新思考',
        avatar: '🚀',
        guidanceStyle: 'inquiry',
        conversationStyle: 'inspiring',
        encouragementStyle: 'balanced',
        maxRounds: 8,
        specialFocus: '鼓励学生提出问题，引导自主探索'
      },
      '2': {
        name: '提升助手',
        role: '帮助学生巩固知识，突破难点',
        avatar: '📈',
        guidanceStyle: 'scaffolding',
        conversationStyle: 'friendly',
        encouragementStyle: 'balanced',
        maxRounds: 6,
        specialFocus: '关注薄弱环节，针对性强化'
      },
      '3': {
        name: '耐心老师',
        role: '循循善诱，帮助学生建立基础概念',
        avatar: '🌱',
        guidanceStyle: 'scaffolding',
        conversationStyle: 'friendly',
        encouragementStyle: 'enthusiastic',
        maxRounds: 8,
        specialFocus: '多用生活实例，降低理解难度'
      },
      '4': {
        name: '启蒙伙伴',
        role: '从零开始，建立学习信心',
        avatar: '🤝',
        guidanceStyle: 'direct',
        conversationStyle: 'friendly',
        encouragementStyle: 'enthusiastic',
        maxRounds: 10,
        specialFocus: '给予充分鼓励，培养学习兴趣'
      }
    };
    return configs[levelId] || configs['2'];
  };

  // 生成分层教学页面
  const handleGenerateTieredPage = () => {
    if (studentLevels.length === 0) {
      alert('请先完成认知起点诊断配置');
      return;
    }

    if (tieredKnowledgePoints.length === 0 || tieredKnowledgePoints.every(kp => !kp.name.trim())) {
      alert('请添加课时知识点');
      return;
    }

    // 获取当前诊断页面的配置组ID
    const diagnosisPage = getCurrentDiagnosisPage();
    if (!diagnosisPage?.diagnosisData?.configGroupId) {
      alert('请先生成试题诊断页面');
      return;
    }

    const configGroupId = diagnosisPage.diagnosisData.configGroupId;
    const groupIndex = diagnosisPage.diagnosisData.groupIndex || 1;

    // 为每个学生等级创建分层配置
    const tieredConfigs: TieredLevelConfig[] = studentLevels.map(level => ({
      levelId: level.id,
      levelName: level.name,
      levelIcon: level.icon,
      levelColor: level.colorClass,
      learningTasks: getDefaultLearningTasks(level.id),
      performanceLevels: [...performanceLevels],
      agentConfig: getDefaultAgentConfig(level.id, level.name),
    }));

    // 检查是否已存在该配置组的分层教学页面
    const existingTieredPage = courseData.pages.find(
      p => p.type === 'tiered-teaching' && p.tieredTeachingData?.configGroupId === configGroupId
    );

    if (existingTieredPage) {
      // 更新现有页面
      const updatedPage: CoursePage = {
        ...existingTieredPage,
        tieredTeachingData: {
          configGroupId,
          groupIndex,
          lessonKnowledgePoints: tieredKnowledgePoints.filter(kp => kp.name.trim()),
          studentLevels: [...studentLevels],
          tieredConfigs,
        }
      };
      dispatchCourse({ type: 'UPDATE_PAGE', payload: updatedPage });
      dispatchEditor({ type: 'SELECT_PAGE', payload: existingTieredPage.id });
      setBoundTieredPageId(existingTieredPage.id);
      return;
    }

    // 找到该配置组最后一个页面的位置（对话诊断或试题诊断）
    const conversationPage = courseData.pages.find(
      p => p.type === 'conversation-diagnosis' && p.conversationDiagnosisData?.configGroupId === configGroupId
    );
    const lastPageInGroup = conversationPage || diagnosisPage;
    const insertOrder = lastPageInGroup.order + 1;

    // 创建新的分层教学页面
    const newPage: CoursePage = {
      id: `tiered-teaching-${Date.now()}`,
      title: `因材施教-分层教学${groupIndex}`,
      type: 'tiered-teaching',
      elements: [],
      order: insertOrder,
      configGroupId,
      tieredTeachingData: {
        configGroupId,
        groupIndex,
        lessonKnowledgePoints: tieredKnowledgePoints.filter(kp => kp.name.trim()),
        studentLevels: [...studentLevels],
        tieredConfigs,
      }
    };

    // 添加页面
    dispatchCourse({ type: 'ADD_PAGE', payload: newPage });

    // 选中新页面
    dispatchEditor({ type: 'SELECT_PAGE', payload: newPage.id });
    setBoundTieredPageId(newPage.id);
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
        {!showStepPages && !showImportFlow ? (
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
              onClick={handleStartImport}
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
        ) : showImportFlow ? (
          // 从资源库导入 - 三步选择流程
          <div className="flex flex-col h-full">
            {/* 头部 */}
            <div className="px-5 pt-4 pb-3">
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={handleImportBack}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                </button>
                <h2 className="text-lg font-bold text-gray-900">选择课程内容</h2>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                {importStep === 1 && '第一步：选择学科'}
                {importStep === 2 && '第二步：选择年级'}
                {importStep === 3 && '第三步：选择课节'}
              </p>
              {/* 进度条 */}
              <div className="flex items-center gap-1.5">
                <div className={`flex-1 h-1 rounded-full transition-all ${importStep >= 1 ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>
                <div className={`flex-1 h-1 rounded-full transition-all ${importStep >= 2 ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>
                <div className={`flex-1 h-1 rounded-full transition-all ${importStep >= 3 ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>
              </div>
            </div>

            {/* 内容区域 */}
            <div className="flex-1 overflow-y-auto px-5 pb-3">
              {/* 步骤1：选择学科 */}
              {importStep === 1 && (
                <div className="grid grid-cols-2 gap-2">
                  {subjects.map((subject) => (
                    <button
                      key={subject}
                      onClick={() => handleImportSelectSubject(subject)}
                      className="bg-gray-50 rounded-xl p-3 hover:bg-emerald-50 hover:border-emerald-300 border-2 border-transparent transition-all text-left"
                    >
                      <div className="text-2xl mb-1">{subjectIcons[subject] || '📖'}</div>
                      <div className="text-sm font-semibold text-gray-900">{subject}</div>
                    </button>
                  ))}
                </div>
              )}

              {/* 步骤2：选择年级 */}
              {importStep === 2 && (
                <div>
                  <div className="text-center mb-3">
                    <span className="text-xs text-gray-500">已选学科：</span>
                    <span className="ml-1 text-sm font-semibold text-emerald-600">{selectedSubject}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {grades.map((grade) => (
                      <button
                        key={grade}
                        onClick={() => handleImportSelectGrade(grade)}
                        className="bg-gray-50 rounded-xl p-3 hover:bg-emerald-50 hover:border-emerald-300 border-2 border-transparent transition-all text-left"
                      >
                        <div className="text-xl mb-1">🎓</div>
                        <div className="text-sm font-semibold text-gray-900">{grade}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 步骤3：选择课节 */}
              {importStep === 3 && (
                <div>
                  <div className="text-center mb-3">
                    <span className="text-xs text-gray-500">已选：</span>
                    <span className="ml-1 text-sm font-semibold text-emerald-600">{selectedSubject}</span>
                    <span className="mx-1 text-gray-400">·</span>
                    <span className="text-sm font-semibold text-teal-600">{selectedGrade}</span>
                  </div>

                  {lessonChapters.length > 0 ? (
                    <div className="space-y-2">
                      {lessonChapters.map((chapterData, chapterIndex) => {
                        const isExpanded = expandedChapter === chapterData.chapter;
                        return (
                          <div
                            key={chapterData.chapter}
                            className="border border-gray-200 rounded-xl overflow-hidden transition-all hover:border-emerald-300"
                          >
                            <button
                              onClick={() => toggleImportChapter(chapterData.chapter)}
                              className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-emerald-50 transition-all"
                            >
                              <div className="flex items-center gap-2">
                                <div className={`w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs font-bold transition-transform ${isExpanded ? 'scale-110' : ''}`}>
                                  {chapterIndex + 1}
                                </div>
                                <span className="font-medium text-gray-900 text-sm text-left">{chapterData.chapter}</span>
                              </div>
                              <svg
                                className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                fill="none" stroke="currentColor" viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>

                            <div className={`transition-all overflow-hidden ${isExpanded ? 'max-h-[400px]' : 'max-h-0'}`}>
                              <div className="p-2 space-y-1 bg-white">
                                {chapterData.lessons.map((lesson) => {
                                  const isSelected = selectedLesson?.id === lesson.id;
                                  return (
                                    <button
                                      key={lesson.id}
                                      onClick={() => handleImportSelectLesson(lesson)}
                                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                                        isSelected
                                          ? 'border-emerald-400 bg-emerald-50'
                                          : 'border-gray-200 hover:border-emerald-200 bg-white'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-semibold ${
                                          isSelected ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                          {lesson.order}
                                        </div>
                                        <span className={`text-sm font-medium ${isSelected ? 'text-emerald-700' : 'text-gray-700'}`}>
                                          {lesson.name}
                                        </span>
                                        {isSelected && (
                                          <svg className="w-4 h-4 text-emerald-500 ml-auto" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                          </svg>
                                        )}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      暂无该学科年级的课节数据
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 底部按钮 */}
            <div className="flex items-center justify-between p-5 border-t border-gray-200">
              <button
                onClick={handleImportBack}
                className="flex items-center gap-1 h-9 px-3 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                上一步
              </button>
              <button
                onClick={handleImportGenerate}
                disabled={!selectedLesson}
                className={`flex items-center gap-1 h-9 px-4 rounded-lg text-sm font-semibold transition-all ${
                  selectedLesson
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                生成页面
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            </div>
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
                          <div className="flex items-center gap-2 mb-2">
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
                          <textarea
                            value={level.description || ''}
                            onChange={(e) => handleUpdateLevel(level.id, { description: e.target.value })}
                            onClick={(e) => e.stopPropagation()}
                            onFocus={() => setEditingLevelId(level.id)}
                            placeholder="分层描述（选填）"
                            rows={2}
                            className="w-full px-2 py-1.5 rounded border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                          />
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
                  <p className="mt-3 text-sm text-gray-600">开启后将自动创建对话诊断页面,请在右侧完成配置。</p>
                </div>
              </div>
            ) : (
              // 第二步：分层教学
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <button
                    onClick={handlePreviousStep}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="15 18 9 12 15 6"/>
                    </svg>
                  </button>
                  <h2 className="text-lg font-bold text-gray-900">分层教学</h2>
                </div>

                {/* 1. 课时知识点 */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-start gap-2 mb-3">
                    <span className="text-xl">🎯</span>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">课时知识点</div>
                      <div className="text-xs text-gray-500">本节课学习目标</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {tieredKnowledgePoints.map((point) => (
                      <div key={point.id} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={point.name}
                          onChange={(e) => handleUpdateTieredKnowledgePoint(point.id, e.target.value)}
                          placeholder="输入知识点名称"
                          className="flex-1 h-9 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        <button
                          onClick={() => handleDeleteTieredKnowledgePoint(point.id)}
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
                    onClick={handleAddTieredKnowledgePoint}
                    className="mt-3 text-sm text-teal-600 font-medium hover:text-teal-700"
                  >
                    + 添加知识点
                  </button>
                </div>

                {/* 2. 认知起点分层（只读） */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-start gap-2 mb-3">
                    <span className="text-xl">🏷️</span>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">认知起点分层</div>
                      <div className="text-xs text-gray-500">来自认知起点诊断配置（不可编辑）</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {studentLevels.map((level) => {
                      const colorMap: Record<string, string> = {
                        emerald: 'bg-emerald-100 border-emerald-300 text-emerald-700',
                        teal: 'bg-teal-100 border-teal-300 text-teal-700',
                        amber: 'bg-amber-100 border-amber-300 text-amber-700',
                        rose: 'bg-rose-100 border-rose-300 text-rose-700',
                        gray: 'bg-gray-100 border-gray-300 text-gray-700',
                      };
                      const colorClass = colorMap[level.colorClass] || colorMap.gray;
                      return (
                        <div
                          key={level.id}
                          className={`rounded-lg p-3 border ${colorClass}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{level.icon}</span>
                            <span className="font-medium text-sm">{level.name}</span>
                            <span className="ml-auto text-xs opacity-75">{level.minScore}-{level.maxScore}分</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {studentLevels.length === 0 && (
                    <div className="text-center py-4 text-gray-400 text-sm">
                      请先完成认知起点诊断配置
                    </div>
                  )}
                </div>

                {/* 3. 学习表现等级（可编辑） */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-start gap-2 mb-3">
                    <span className="text-xl">🏅</span>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">学习表现等级</div>
                      <div className="text-xs text-gray-500">配置学习任务完成后的评价等级</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {performanceLevels.map((level) => {
                      const isEditing = editingPerformanceLevelId === level.id;
                      const colorMap: Record<string, string> = {
                        emerald: 'bg-emerald-50 border-emerald-300',
                        blue: 'bg-blue-50 border-blue-300',
                        amber: 'bg-amber-50 border-amber-300',
                        rose: 'bg-rose-50 border-rose-300',
                        gray: 'bg-gray-50 border-gray-300',
                      };
                      const colorClass = colorMap[level.color] || colorMap.gray;
                      return (
                        <div
                          key={level.id}
                          className={`rounded-lg p-3 transition-all cursor-pointer border ${
                            isEditing
                              ? `${colorClass} shadow-sm`
                              : 'border-gray-200 hover:bg-gray-100'
                          }`}
                          onClick={() => setEditingPerformanceLevelId(level.id)}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{level.icon}</span>
                            <input
                              type="text"
                              value={level.name}
                              onChange={(e) => handleUpdatePerformanceLevel(level.id, { name: e.target.value })}
                              onFocus={() => setEditingPerformanceLevelId(level.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="flex-1 h-8 px-2 rounded border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-gray-600">最低分:</span>
                            <input
                              type="number"
                              value={level.minScore}
                              onChange={(e) => handleUpdatePerformanceLevel(level.id, { minScore: parseInt(e.target.value) || 0 })}
                              onFocus={() => setEditingPerformanceLevelId(level.id)}
                              onClick={(e) => e.stopPropagation()}
                              min="0"
                              max="100"
                              className="w-14 h-8 px-2 rounded border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                            <span className="text-xs text-gray-600">最高分:</span>
                            <input
                              type="number"
                              value={level.maxScore}
                              onChange={(e) => handleUpdatePerformanceLevel(level.id, { maxScore: parseInt(e.target.value) || 0 })}
                              onFocus={() => setEditingPerformanceLevelId(level.id)}
                              onClick={(e) => e.stopPropagation()}
                              min="0"
                              max="100"
                              className="w-14 h-8 px-2 rounded border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePerformanceLevel(level.id);
                              }}
                              className="ml-auto p-1 rounded hover:bg-gray-200 transition-colors"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                              </svg>
                            </button>
                          </div>
                          <textarea
                            value={level.description || ''}
                            onChange={(e) => handleUpdatePerformanceLevel(level.id, { description: e.target.value })}
                            onClick={(e) => e.stopPropagation()}
                            onFocus={() => setEditingPerformanceLevelId(level.id)}
                            placeholder="等级描述（选填）"
                            rows={2}
                            className="w-full px-2 py-1.5 rounded border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                          />
                        </div>
                      );
                    })}
                  </div>
                  <button
                    onClick={handleAddPerformanceLevel}
                    className="mt-3 text-sm text-teal-600 font-medium hover:text-teal-700"
                  >
                    + 添加等级
                  </button>
                </div>

                {/* 4. 生成分层教学页面按钮 */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-start gap-2 mb-3">
                    <span className="text-xl">📚</span>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">分层教学页面</div>
                      <div className="text-xs text-gray-500">为每个认知层次配置差异化学习内容</div>
                    </div>
                  </div>
                  <button
                    onClick={handleGenerateTieredPage}
                    disabled={studentLevels.length === 0 || tieredKnowledgePoints.length === 0}
                    className={`w-full h-10 rounded-xl text-sm font-semibold transition-colors ${
                      studentLevels.length > 0 && tieredKnowledgePoints.length > 0
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {boundTieredPageId ? '更新页面' : '生成页面'}
                  </button>
                  {(studentLevels.length === 0 || tieredKnowledgePoints.length === 0) && (
                    <p className="mt-2 text-xs text-gray-500 text-center">
                      {studentLevels.length === 0 ? '请先完成认知起点诊断配置' : '请添加课时知识点'}
                    </p>
                  )}
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
                  disabled={!boundPageId}
                  className={`ml-auto flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold transition-colors ${
                    boundPageId
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
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
