// 课件编辑器类型定义

// 菜单面板类型
export type PanelType = 'ai' | 'pages' | 'tools' | 'apps' | 'web' | 'resources' | 'speaking' | 'differentiated';

// 工具类型
export type ToolType =
  | 'choice'
  | 'qa'
  | 'vote'
  | 'photo'
  | 'fillblank'
  | 'sort'
  | 'whiteboard'
  | 'flashcard'
  | 'cocopi'
  | 'workspace';

// 页面模板类型
export type PageTemplateType =
  | 'title'
  | 'image'
  | 'content'
  | 'text-image'
  | 'image-text'
  | 'diagnosis'
  | 'conversation-diagnosis'
  | 'tiered-teaching';

// 聊天消息
export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

// 页面元素
export interface SlideElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'table';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  src?: string;
  shapeType?: 'circle' | 'rectangle' | 'triangle' | 'arrow';
}

// 课件页面
export interface CoursePage {
  id: string;
  title: string;
  type: PageTemplateType | ToolType | 'web' | 'app';
  elements: SlideElement[];
  order: number;
  hidden?: boolean; // 是否隐藏（用于对话诊断开关关闭时保留配置）
  configGroupId?: string; // 配置组ID，用于关联同一套配置的诊断页面
  diagnosisData?: DiagnosisPageData;
  conversationDiagnosisData?: ConversationDiagnosisPageData;
  tieredTeachingData?: TieredTeachingPageData; // 分层教学页面数据
}

// 大纲分组
export interface OutlineGroup {
  id: string;
  title: string;
  pages: CoursePage[];
  collapsed: boolean;
}

// 课程数据
export interface CourseData {
  id: string;
  title: string;
  pages: CoursePage[];
  groups: OutlineGroup[];
  createdAt: Date;
  updatedAt: Date;
}

// AI应用
export interface AIApp {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  icon?: string;
}

// 交互网页
export interface InteractiveWeb {
  id: string;
  name: string;
  description: string;
  url?: string;
  htmlContent?: string;
  thumbnail?: string;
}

// 发布配置
export interface PublishConfig {
  subject: string;
  grade: string;
  classId: string;
  visibility: 'students' | 'organization' | 'public';
  coverImage?: string;
}

// 编辑器模式
export type EditorMode = 'initial' | 'edit' | 'tool';

// 编辑器状态
export interface EditorState {
  activePanel: PanelType;
  isPanelCollapsed: boolean;
  isRightPanelCollapsed: boolean;
  selectedElement: string | null;
  selectedPage: string | null;
  isGenerating: boolean;
  saveStatus: 'saved' | 'saving' | 'unsaved';
  // 新增：编辑器模式
  editorMode: EditorMode;
  // 新增：当前工具类型（工具模式下使用）
  currentTool: ToolType | null;
}

// 因材施教相关类型
export interface KnowledgePoint {
  id: string;
  name: string;
}

export interface StudentLevel {
  id: string;
  name: string;
  icon: string;
  minScore: number;
  maxScore: number;
  colorClass: string;
}

export interface TestDiagnosisConfig {
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  count: number;
}

// 诊断题目类型
export interface DiagnosisQuestion {
  id: string;
  type: 'single' | 'multiple' | 'judge';
  difficulty: 'hard' | 'medium-hard' | 'medium' | 'medium-easy' | 'easy';
  knowledgePoint: string;
  content: string;
  options?: string[];
  answer: string | string[];
  analysis?: string;
}

// 诊断页面配置
export interface DiagnosisConfig {
  knowledgePoints: KnowledgePoint[];
  studentLevels: StudentLevel[];
  selectedDifficulties: string[];
  questionCounts: Record<string, number>;
  conversationEnabled: boolean;
}

// 诊断页面数据
export interface DiagnosisPageData {
  questions: DiagnosisQuestion[];
  knowledgePoints: string[];
  config: DiagnosisConfig;
  configGroupId?: string; // 配置组ID
  groupIndex?: number; // 在所有配置组中的序号（用于编号）
}

// 对话诊断配置
export type DialogueStyle = 'formal' | 'friendly' | 'inspiring';
export type ScoringPreference = 'strict' | 'moderate' | 'encouraging';
export type EncouragementStyle = 'brief' | 'moderate' | 'enthusiastic';

// 语音播报配置
export interface VoiceConfig {
  voiceId: string;
  pitch: number; // -100 to 100
  volume: number; // 0 to 100
  speed: number; // 0.5x to 2x
  autoRead: boolean;
}

// 角色配置
export interface AvatarConfig {
  imageUrl: string;
  name: string;
}

// 背景配置
export interface BackgroundConfig {
  imageUrl: string;
}

export interface ConversationDiagnosisConfig {
  aiRole: string;
  dialogueStyle: DialogueStyle;
  scoringPreference: ScoringPreference;
  encouragementStyle: EncouragementStyle;
  maxRounds: number;
  specialFocus: string;
  customPrompt: string;
  isAdvancedMode: boolean;
  // 高级配置
  avatarConfig?: AvatarConfig;
  voiceConfig?: VoiceConfig;
  backgroundConfig?: BackgroundConfig;
}

// 对话诊断页面数据
export interface ConversationDiagnosisPageData {
  config: ConversationDiagnosisConfig;
  linkedDiagnosisPageId: string; // 关联的试题诊断页面ID
  configGroupId?: string; // 配置组ID
}

export interface DifferentiatedTeachingState {
  hasUploadedDesign: boolean;
  currentStep: number; // 1=认知起点诊断, 2=分层教学
  knowledgePoints: KnowledgePoint[];
  studentLevels: StudentLevel[];
  testConfig: TestDiagnosisConfig;
  conversationEnabled: boolean;
  generatedSlides: {
    diagnosis: string[];
    diagnosisConversation: string[];
    tiered: string[];
  };
}

// 分层教学相关类型
export interface LearningTask {
  id: string;
  title: string;
  description: string;
  resources?: string[];
}

export interface EvaluationCriteria {
  id: string;
  name: string;
  description: string;
  weight: number;
}

export interface LearningPerformanceLevel {
  id: string;
  name: string;
  icon: string;
  color: string;
  minScore: number;
  maxScore: number;
  description: string;
}

export type GuidanceStyle = 'direct' | 'scaffolding' | 'inquiry';
export type ConversationStyle = 'formal' | 'friendly' | 'inspiring';
export type AgentEncouragementStyle = 'minimal' | 'balanced' | 'enthusiastic';

export interface TieredAgentConfig {
  name: string;
  role: string;
  avatar: string;
  guidanceStyle: GuidanceStyle;
  conversationStyle: ConversationStyle;
  encouragementStyle: AgentEncouragementStyle;
  maxRounds: number;
  specialFocus?: string;
  advancedPrompt?: string;
}

export interface TieredLevelConfig {
  levelId: string;
  levelName: string;
  levelIcon: string;
  levelColor: string;
  learningTasks: LearningTask[];
  evaluationCriteria: EvaluationCriteria[];
  performanceLevels: LearningPerformanceLevel[];
  agentConfig: TieredAgentConfig;
}

export interface TieredTeachingPageData {
  configGroupId: string;
  groupIndex: number;
  lessonKnowledgePoints: KnowledgePoint[]; // 课时知识点
  studentLevels: StudentLevel[]; // 从认知起点诊断读取的分层（只读）
  tieredConfigs: TieredLevelConfig[]; // 每个分层的配置
}
