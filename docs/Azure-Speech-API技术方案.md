# Azure Speech Service API 技术方案

<solution-overview>
  <name>坪山区英语口语学习平台 - Azure Speech API 集成方案</name>
  <architecture>Azure Speech Service + Azure OpenAI Service + 自研业务层</architecture>
  <deployment>云端 API 调用 + 前端 SDK 集成</deployment>
</solution-overview>

---

## 技术架构

<architecture>
  <layer name="前端层">
    <component>React/Next.js Web 应用</component>
    <component>Azure Speech SDK (JavaScript)</component>
    <component>实时音频采集与播放</component>
  </layer>

  <layer name="API 网关层">
    <component>Next.js API Routes</component>
    <component>认证与鉴权中间件</component>
    <component>请求限流与监控</component>
  </layer>

  <layer name="Azure 服务层">
    <service name="Azure Speech Service">
      <feature>Speech-to-Text (ASR)</feature>
      <feature>Text-to-Speech (TTS)</feature>
      <feature>Pronunciation Assessment</feature>
    </service>
    <service name="Azure OpenAI Service">
      <feature>GPT-4 对话生成</feature>
      <feature>语义理解与意图识别</feature>
      <feature>自适应难度调整</feature>
    </service>
  </layer>

  <layer name="业务逻辑层">
    <component>对话状态管理</component>
    <component>学情数据分析</component>
    <component>自适应难度引擎</component>
    <component>学习记录存储</component>
  </layer>

  <layer name="数据层">
    <component>PostgreSQL (学生数据、对话记录)</component>
    <component>Redis (会话缓存、实时数据)</component>
    <component>Azure Blob Storage (音频文件)</component>
  </layer>
</architecture>

---

## API 集成方案

### 1. Speech-to-Text (语音识别)

<api name="Speech-to-Text">
  <endpoint>https://{region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1</endpoint>

  <authentication>
    <method>Subscription Key</method>
    <header>Ocp-Apim-Subscription-Key: {your-key}</header>
  </authentication>

  <request-format>
    <content-type>audio/wav; codecs=audio/pcm; samplerate=16000</content-type>
    <language>en-US</language>
    <recognition-mode>Interactive / Conversation / Dictation</recognition-mode>
  </request-format>

  <response-format>
    <field name="RecognitionStatus">Success / Error</field>
    <field name="DisplayText">识别的文本内容</field>
    <field name="Offset">音频偏移量（100纳秒单位）</field>
    <field name="Duration">音频时长</field>
  </response-format>

  <implementation>
```javascript
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

// 初始化语音配置
const speechConfig = sdk.SpeechConfig.fromSubscription(
  process.env.AZURE_SPEECH_KEY,
  process.env.AZURE_SPEECH_REGION
);
speechConfig.speechRecognitionLanguage = 'en-US';

// 从麦克风识别
const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

// 实时识别
recognizer.recognizing = (s, e) => {
  console.log(`识别中: ${e.result.text}`);
};

recognizer.recognized = (s, e) => {
  if (e.result.reason === sdk.ResultReason.RecognizedSpeech) {
    console.log(`识别结果: ${e.result.text}`);
  }
};

recognizer.startContinuousRecognitionAsync();
```
  </implementation>

  <custom-speech>
    <description>针对儿童语音优化</description>
    <steps>
      <step>收集目标年龄段学生语音样本（建议 1000+ 条）</step>
      <step>在 Speech Studio 创建 Custom Speech 项目</step>
      <step>上传音频 + 转写文本进行训练</step>
      <step>部署定制模型并获取 Endpoint ID</step>
      <step>在代码中指定 EndpointId 使用定制模型</step>
    </steps>
  </custom-speech>
</api>

---

### 2. Text-to-Speech (语音合成)

<api name="Text-to-Speech">
  <endpoint>https://{region}.tts.speech.microsoft.com/cognitiveservices/v1</endpoint>

  <authentication>
    <method>Subscription Key</method>
    <header>Ocp-Apim-Subscription-Key: {your-key}</header>
  </authentication>

  <request-format>
    <content-type>application/ssml+xml</content-type>
    <ssml-example>
```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
  <voice name="en-US-JennyNeural">
    <prosody rate="0.9" pitch="+5%">
      Hello! How are you today?
    </prosody>
  </voice>
</speak>
```
    </ssml-example>
  </request-format>

  <voice-selection>
    <category name="儿童友好语音">
      <voice>en-US-JennyNeural (女声，温暖友好)</voice>
      <voice>en-US-GuyNeural (男声，活力阳光)</voice>
      <voice>en-US-AriaNeural (女声，清晰标准)</voice>
    </category>
    <category name="HD 高清语音">
      <voice>en-US-JennyMultilingualNeural (多语言支持)</voice>
      <voice>en-US-AndrewMultilingualNeural (自然流畅)</voice>
    </category>
  </voice-selection>

  <implementation>
```javascript
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

const speechConfig = sdk.SpeechConfig.fromSubscription(
  process.env.AZURE_SPEECH_KEY,
  process.env.AZURE_SPEECH_REGION
);

// 选择语音
speechConfig.speechSynthesisVoiceName = 'en-US-JennyNeural';

const synthesizer = new sdk.SpeechSynthesizer(speechConfig);

// 使用 SSML 合成
const ssml = `
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
  <voice name="en-US-JennyNeural">
    <prosody rate="0.9" pitch="+5%">
      ${text}
    </prosody>
  </voice>
</speak>
`;

synthesizer.speakSsmlAsync(
  ssml,
  result => {
    if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
      console.log('语音合成成功');
      // result.audioData 包含音频数据
    }
    synthesizer.close();
  },
  error => {
    console.error('合成失败:', error);
    synthesizer.close();
  }
);
```
  </implementation>
</api>

---

### 3. Pronunciation Assessment (发音评估)

<api name="Pronunciation-Assessment">
  <endpoint>与 Speech-to-Text 相同，通过参数启用</endpoint>

  <configuration>
```javascript
const pronunciationConfig = new sdk.PronunciationAssessmentConfig(
  referenceText,  // 参考文本（可选，用于朗读评估）
  sdk.PronunciationAssessmentGradingSystem.HundredMark,
  sdk.PronunciationAssessmentGranularity.Phoneme,
  true  // 启用韵律评估
);

// 启用更多评估维度
pronunciationConfig.enableProsodyAssessment = true;
pronunciationConfig.enableContentAssessmentWithTopic = true;

pronunciationConfig.applyTo(recognizer);
```
  </configuration>

  <assessment-dimensions>
    <dimension name="AccuracyScore">
      <description>发音准确度（0-100）</description>
      <granularity>音素级、单词级、句子级</granularity>
    </dimension>
    <dimension name="FluencyScore">
      <description>流畅度（0-100）</description>
      <metrics>语速、停顿、卡顿频率</metrics>
    </dimension>
    <dimension name="ProsodyScore">
      <description>韵律评分（0-100）</description>
      <metrics>语调、重音、节奏</metrics>
    </dimension>
    <dimension name="CompletenessScore">
      <description>完整度（0-100）</description>
      <metrics>漏读、插入、替换</metrics>
    </dimension>
    <dimension name="PronunciationScore">
      <description>综合发音分数（0-100）</description>
      <formula>加权平均（准确度、流畅度、韵律）</formula>
    </dimension>
  </assessment-dimensions>

  <response-example>
```json
{
  "NBest": [{
    "PronunciationAssessment": {
      "AccuracyScore": 87.5,
      "FluencyScore": 82.3,
      "ProsodyScore": 78.9,
      "CompletenessScore": 95.0,
      "PronScore": 84.2
    },
    "Words": [
      {
        "Word": "hello",
        "PronunciationAssessment": {
          "AccuracyScore": 92.0,
          "ErrorType": "None"
        },
        "Phonemes": [
          {
            "Phoneme": "h",
            "PronunciationAssessment": {
              "AccuracyScore": 95.0
            }
          },
          {
            "Phoneme": "ə",
            "PronunciationAssessment": {
              "AccuracyScore": 88.0
            }
          }
        ]
      }
    ]
  }]
}
```
  </response-example>

  <implementation>
```javascript
// 完整的发音评估流程
async function assessPronunciation(audioBlob, referenceText) {
  const speechConfig = sdk.SpeechConfig.fromSubscription(
    process.env.AZURE_SPEECH_KEY,
    process.env.AZURE_SPEECH_REGION
  );

  const audioConfig = sdk.AudioConfig.fromWavFileInput(audioBlob);
  const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

  // 配置发音评估
  const pronunciationConfig = new sdk.PronunciationAssessmentConfig(
    referenceText,
    sdk.PronunciationAssessmentGradingSystem.HundredMark,
    sdk.PronunciationAssessmentGranularity.Phoneme,
    true
  );

  pronunciationConfig.enableProsodyAssessment = true;
  pronunciationConfig.applyTo(recognizer);

  return new Promise((resolve, reject) => {
    recognizer.recognizeOnceAsync(result => {
      if (result.reason === sdk.ResultReason.RecognizedSpeech) {
        const pronunciationResult =
          sdk.PronunciationAssessmentResult.fromResult(result);

        resolve({
          text: result.text,
          accuracyScore: pronunciationResult.accuracyScore,
          fluencyScore: pronunciationResult.fluencyScore,
          prosodyScore: pronunciationResult.prosodyScore,
          pronunciationScore: pronunciationResult.pronunciationScore,
          words: pronunciationResult.detailResult.Words
        });
      } else {
        reject(new Error('识别失败'));
      }
      recognizer.close();
    });
  });
}
```
  </implementation>
</api>

---

### 4. Azure OpenAI Service (对话生成)

<api name="Azure-OpenAI">
  <endpoint>https://{resource-name}.openai.azure.com/openai/deployments/{deployment-id}/chat/completions?api-version=2024-02-15-preview</endpoint>

  <authentication>
    <method>API Key</method>
    <header>api-key: {your-key}</header>
  </authentication>

  <request-format>
```json
{
  "messages": [
    {
      "role": "system",
      "content": "You are a friendly English teacher for elementary school students. Adjust your language difficulty based on the student's level."
    },
    {
      "role": "user",
      "content": "Hello, how are you?"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 150
}
```
  </request-format>

  <implementation>
```javascript
import { OpenAIClient, AzureKeyCredential } from '@azure/openai';

const client = new OpenAIClient(
  process.env.AZURE_OPENAI_ENDPOINT,
  new AzureKeyCredential(process.env.AZURE_OPENAI_KEY)
);

async function generateResponse(conversationHistory, studentLevel) {
  const systemPrompt = `You are a friendly English teacher for ${studentLevel} level students.
  Use simple vocabulary and short sentences.
  Provide encouragement and correct errors gently.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory
  ];

  const result = await client.getChatCompletions(
    process.env.AZURE_OPENAI_DEPLOYMENT,
    messages,
    {
      temperature: 0.7,
      maxTokens: 150
    }
  );

  return result.choices[0].message.content;
}
```
  </implementation>
</api>

---

## 完整对话流程

<conversation-flow>
  <step number="1" name="学生发起对话">
    <action>前端录制音频</action>
    <action>上传音频到后端 API</action>
  </step>

  <step number="2" name="语音识别 + 发音评估">
    <action>调用 Azure Speech-to-Text API</action>
    <action>同时启用 Pronunciation Assessment</action>
    <output>识别文本 + 发音评分</output>
  </step>

  <step number="3" name="语义理解 + 响应生成">
    <action>将识别文本发送到 Azure OpenAI</action>
    <action>根据学生水平调整响应难度</action>
    <output>AI 生成的回复文本</output>
  </step>

  <step number="4" name="语音合成">
    <action>将回复文本转换为 SSML</action>
    <action>调用 Azure TTS API</action>
    <output>音频文件</output>
  </step>

  <step number="5" name="返回前端">
    <action>返回音频 URL + 文本 + 发音评分</action>
    <action>前端播放音频并显示文本</action>
  </step>

  <step number="6" name="数据存储">
    <action>保存对话记录到数据库</action>
    <action>更新学生学情数据</action>
    <action>触发自适应难度调整</action>
  </step>
</conversation-flow>

---

## 成本估算

<cost-estimation>
  <service name="Azure Speech Service">
    <pricing>
      <item>Speech-to-Text: $1.00 / 小时</item>
      <item>Neural TTS: $16.00 / 100万字符</item>
      <item>Pronunciation Assessment: 包含在 STT 价格中</item>
    </pricing>
    <monthly-estimate>
      <assumption>1000 学生，每人每天 10 分钟对话</assumption>
      <calculation>
        STT: 1000 × 10/60 × 30 × $1.00 = $5,000
        TTS: 1000 × 500字符 × 30 × $16/1M = $240
      </calculation>
      <total>约 $5,240 / 月</total>
    </monthly-estimate>
  </service>

  <service name="Azure OpenAI Service">
    <pricing>
      <item>GPT-4: $0.03 / 1K input tokens, $0.06 / 1K output tokens</item>
    </pricing>
    <monthly-estimate>
      <assumption>每次对话 500 tokens (input + output)</assumption>
      <calculation>
        1000 × 10轮 × 30 × 500 × $0.045/1K = $6,750
      </calculation>
      <total>约 $6,750 / 月</total>
    </monthly-estimate>
  </service>

  <total-monthly-cost>约 $12,000 / 月</total-monthly-cost>
</cost-estimation>

---

## 性能优化建议

<optimizations>
  <optimization name="音频压缩">
    <description>使用 Opus 编码压缩音频，减少传输时间</description>
    <impact>传输时间减少 60%</impact>
  </optimization>

  <optimization name="流式识别">
    <description>使用 WebSocket 实现实时流式识别</description>
    <impact>响应延迟降低至 200-500ms</impact>
  </optimization>

  <optimization name="TTS 缓存">
    <description>缓存常用句子的 TTS 音频</description>
    <impact>成本降低 30-40%</impact>
  </optimization>

  <optimization name="批量处理">
    <description>非实时场景使用批量 API</description>
    <impact>成本降低 50%</impact>
  </optimization>

  <optimization name="CDN 加速">
    <description>音频文件通过 CDN 分发</description>
    <impact>加载速度提升 3-5 倍</impact>
  </optimization>
</optimizations>

---

## 安全与合规

<security>
  <measure name="数据加密">
    <description>传输层使用 TLS 1.2+，存储层使用 AES-256</description>
  </measure>

  <measure name="访问控制">
    <description>API Key 存储在环境变量，使用 Azure Key Vault 管理</description>
  </measure>

  <measure name="隐私保护">
    <description>音频文件 30 天后自动删除，符合 GDPR/COPPA</description>
  </measure>

  <measure name="内容过滤">
    <description>启用 Azure Content Safety API 过滤不当内容</description>
  </measure>
</security>

---

## 部署清单

<deployment-checklist>
  <task>创建 Azure Speech Service 资源</task>
  <task>创建 Azure OpenAI Service 资源并部署 GPT-4 模型</task>
  <task>配置 Custom Speech 模型（儿童语音优化）</task>
  <task>设置 Azure Blob Storage 存储音频文件</task>
  <task>配置 CDN 加速音频分发</task>
  <task>部署 Next.js 应用到 Vercel/Azure App Service</task>
  <task>配置环境变量和密钥管理</task>
  <task>设置监控和日志（Azure Monitor）</task>
  <task>配置自动扩展策略</task>
  <task>进行压力测试和性能调优</task>
</deployment-checklist>
