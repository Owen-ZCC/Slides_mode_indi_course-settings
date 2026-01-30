'use client';

import { createContext, useContext, useReducer, ReactNode } from 'react';
import {
  EditorState,
  PanelType,
  CourseData,
  CoursePage,
  ChatMessage,
  OutlineGroup,
  ToolType,
} from '@/types';

// 初始状态
const initialEditorState: EditorState = {
  activePanel: 'ai',
  isPanelCollapsed: false,
  isRightPanelCollapsed: true,
  selectedElement: null,
  selectedPage: null,
  isGenerating: false,
  saveStatus: 'unsaved',
  editorMode: 'initial',
  currentTool: null,
};

const initialCourseData: CourseData = {
  id: '',
  title: '新建课程',
  pages: [],
  groups: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Action 类型
type EditorAction =
  | { type: 'SET_ACTIVE_PANEL'; payload: PanelType }
  | { type: 'TOGGLE_PANEL_COLLAPSE' }
  | { type: 'TOGGLE_RIGHT_PANEL' }
  | { type: 'SELECT_ELEMENT'; payload: string | null }
  | { type: 'SELECT_PAGE'; payload: string | null }
  | { type: 'SET_GENERATING'; payload: boolean }
  | { type: 'SET_SAVE_STATUS'; payload: 'saved' | 'saving' | 'unsaved' }
  | { type: 'SET_EDITOR_MODE'; payload: 'initial' | 'edit' | 'tool' }
  | { type: 'SET_CURRENT_TOOL'; payload: ToolType | null }
  | { type: 'SWITCH_TO_EDIT_MODE' }
  | { type: 'SWITCH_TO_TOOL_MODE'; payload: ToolType };

type CourseAction =
  | { type: 'SET_TITLE'; payload: string }
  | { type: 'ADD_PAGE'; payload: CoursePage }
  | { type: 'UPDATE_PAGE'; payload: CoursePage }
  | { type: 'DELETE_PAGE'; payload: string }
  | { type: 'REORDER_PAGES'; payload: CoursePage[] }
  | { type: 'ADD_GROUP'; payload: OutlineGroup }
  | { type: 'UPDATE_GROUP'; payload: OutlineGroup }
  | { type: 'DELETE_GROUP'; payload: string }
  | { type: 'SET_COURSE'; payload: CourseData };

type ChatAction =
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'CLEAR_MESSAGES' };

// Reducers
function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SET_ACTIVE_PANEL':
      return { ...state, activePanel: action.payload, isPanelCollapsed: false };
    case 'TOGGLE_PANEL_COLLAPSE':
      return { ...state, isPanelCollapsed: !state.isPanelCollapsed };
    case 'TOGGLE_RIGHT_PANEL':
      return { ...state, isRightPanelCollapsed: !state.isRightPanelCollapsed };
    case 'SELECT_ELEMENT':
      return { ...state, selectedElement: action.payload };
    case 'SELECT_PAGE':
      return { ...state, selectedPage: action.payload };
    case 'SET_GENERATING':
      return { ...state, isGenerating: action.payload };
    case 'SET_SAVE_STATUS':
      return { ...state, saveStatus: action.payload };
    case 'SET_EDITOR_MODE':
      return { ...state, editorMode: action.payload };
    case 'SET_CURRENT_TOOL':
      return { ...state, currentTool: action.payload };
    case 'SWITCH_TO_EDIT_MODE':
      return { ...state, editorMode: 'edit', currentTool: null };
    case 'SWITCH_TO_TOOL_MODE':
      return { ...state, editorMode: 'tool', currentTool: action.payload };
    default:
      return state;
  }
}

// 验证页面顺序：对话诊断必须在试题诊断之后（只验证非隐藏页面）
function validatePageOrder(pages: CoursePage[]): { valid: boolean; message?: string } {
  const visiblePages = pages.filter(p => !p.hidden);
  const diagnosisIndex = visiblePages.findIndex(p => p.type === 'diagnosis');
  const conversationIndex = visiblePages.findIndex(p => p.type === 'conversation-diagnosis');

  // 如果两种页面都存在，检查顺序
  if (diagnosisIndex !== -1 && conversationIndex !== -1) {
    if (conversationIndex < diagnosisIndex) {
      return {
        valid: false,
        message: '学生须完成"试题诊断"才能进入"对话诊断"'
      };
    }
  }

  return { valid: true };
}

function courseReducer(state: CourseData, action: CourseAction): CourseData {
  switch (action.type) {
    case 'SET_TITLE':
      return { ...state, title: action.payload, updatedAt: new Date() };
    case 'ADD_PAGE':
      return {
        ...state,
        pages: [...state.pages, action.payload],
        updatedAt: new Date(),
      };
    case 'UPDATE_PAGE':
      return {
        ...state,
        pages: state.pages.map((p) =>
          p.id === action.payload.id ? action.payload : p
        ),
        updatedAt: new Date(),
      };
    case 'DELETE_PAGE':
      return {
        ...state,
        pages: state.pages.filter((p) => p.id !== action.payload),
        updatedAt: new Date(),
      };
    case 'REORDER_PAGES': {
      // 验证页面顺序
      const validation = validatePageOrder(action.payload);
      if (!validation.valid) {
        // 如果顺序无效，显示提示并返回原状态
        if (typeof window !== 'undefined') {
          alert(validation.message);
        }
        return state;
      }
      return { ...state, pages: action.payload, updatedAt: new Date() };
    }
    case 'ADD_GROUP':
      return {
        ...state,
        groups: [...state.groups, action.payload],
        updatedAt: new Date(),
      };
    case 'UPDATE_GROUP':
      return {
        ...state,
        groups: state.groups.map((g) =>
          g.id === action.payload.id ? action.payload : g
        ),
        updatedAt: new Date(),
      };
    case 'DELETE_GROUP':
      return {
        ...state,
        groups: state.groups.filter((g) => g.id !== action.payload),
        updatedAt: new Date(),
      };
    case 'SET_COURSE':
      return action.payload;
    default:
      return state;
  }
}

function chatReducer(state: ChatMessage[], action: ChatAction): ChatMessage[] {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return [...state, action.payload];
    case 'CLEAR_MESSAGES':
      return [];
    default:
      return state;
  }
}

// Context
interface EditorContextType {
  editorState: EditorState;
  courseData: CourseData;
  chatMessages: ChatMessage[];
  dispatchEditor: React.Dispatch<EditorAction>;
  dispatchCourse: React.Dispatch<CourseAction>;
  dispatchChat: React.Dispatch<ChatAction>;
}

const EditorContext = createContext<EditorContextType | null>(null);

// Provider
export function EditorProvider({ children }: { children: ReactNode }) {
  const [editorState, dispatchEditor] = useReducer(
    editorReducer,
    initialEditorState
  );
  const [courseData, dispatchCourse] = useReducer(
    courseReducer,
    initialCourseData
  );
  const [chatMessages, dispatchChat] = useReducer(chatReducer, []);

  return (
    <EditorContext.Provider
      value={{
        editorState,
        courseData,
        chatMessages,
        dispatchEditor,
        dispatchCourse,
        dispatchChat,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

// Hook
export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
}
