# ChatGPTFirewall 调试日志系统使用指南

## 📋 **概述**

为ChatGPTFirewall项目创建了完整的调试日志系统，包括文件上传、认证、向量化处理等关键环节的详细日志记录和监控。

## 🔧 **组件架构**

### 1. **日志配置系统** (`logging_config.py`)
- **功能**: 统一的日志配置管理
- **特性**: 
  - 分级日志记录（DEBUG、INFO、WARNING、ERROR）
  - 按功能模块分离的日志文件
  - 自动日志轮转和清理
  - 性能监控装饰器
  - 错误跟踪装饰器

### 2. **增强版文件上传API** (`enhanced_upload_api.py`)
- **功能**: 带详细日志的文件上传处理
- **日志记录**:
  - 每个上传会话的唯一ID
  - 文件验证过程
  - 文本提取详情
  - 向量化进度
  - 错误回滚机制

### 3. **增强版认证中间件** (`enhanced_auth_middleware.py`)
- **功能**: 认证过程的完整日志跟踪
- **日志记录**:
  - Token提取和验证
  - 用户信息获取
  - JWT载荷分析
  - 认证失败原因
  - 性能统计

### 4. **增强版向量化处理** (`enhanced_vectorization.py`)
- **功能**: 向量化流程的详细监控
- **日志记录**:
  - 模型加载状态
  - 文本预处理步骤
  - 分段处理详情
  - 向量生成统计
  - Qdrant存储状态

### 5. **系统状态监控** (`system_monitor.py`)
- **功能**: 实时系统健康监控
- **监控内容**:
  - 系统资源使用率
  - 组件状态检查
  - 日志文件分析
  - 错误趋势分析
  - 自动警报生成

## 📁 **日志文件结构**

```
logs/
├── debug.log              # 通用调试日志
├── upload.log             # 文件上传日志
├── auth.log               # 认证相关日志
├── vectorization.log      # 向量化处理日志
├── error.log              # 错误汇总日志
├── system_monitor.log     # 监控系统日志
└── monitoring_result_*.json  # 监控结果快照
```

## 🚀 **部署集成步骤**

### 1. **安装依赖**
```bash
pip install psutil
# 如果需要JSON日志格式
pip install python-json-logger
```

### 2. **集成到现有代码**

#### **A. 在Django settings.py中配置日志**
```python
# settings.py
from logging_config import LOGGING_CONFIG
LOGGING = LOGGING_CONFIG

# 在应用启动时初始化
from logging_config import setup_logging
setup_logging()
```

#### **B. 替换现有的上传API**
```python
# urls.py
from enhanced_upload_api import EnhancedUploadApiView

urlpatterns = [
    path('api/documents/upload/', EnhancedUploadApiView.as_view(), name='upload'),
    # ... 其他路由
]
```

#### **C. 添加认证中间件**
```python
# settings.py
MIDDLEWARE = [
    # ... 其他中间件
    'enhanced_auth_middleware.EnhancedAuthMiddleware',
    # ... 
]
```

#### **D. 集成增强版向量化**
```python
# 在现有的向量化调用处
from enhanced_vectorization import vectorize_document_enhanced

# 替换原有调用
result = vectorize_document_enhanced(document, language)
if result.success:
    print(f"向量化成功: {result.sections_created} 段落")
else:
    print(f"向量化失败: {result.error}")
```

### 3. **启动监控系统**

#### **单次监控检查**
```bash
python system_monitor.py
```

#### **持续监控**
```bash
# 每5分钟检查一次
python system_monitor.py continuous 300
```

#### **后台持续监控**
```bash
# Linux/Mac
nohup python system_monitor.py continuous 300 &

# Windows (PowerShell)
Start-Process python -ArgumentList "system_monitor.py", "continuous", "300" -WindowStyle Hidden
```

## 📊 **日志分析示例**

### 1. **查看上传流程**
```bash
# 查看最近的上传活动
tail -f logs/upload.log

# 搜索特定上传会话
grep "upload_20231201_143022" logs/upload.log
```

### 2. **分析认证问题**
```bash
# 查看认证失败
grep "认证失败\|🚫" logs/auth.log

# 查看特定用户的认证记录
grep "auth0|user123" logs/auth.log
```

### 3. **监控向量化性能**
```bash
# 查看向量化耗时
grep "向量化完成.*耗时" logs/vectorization.log

# 查看模型加载状态
grep "模型加载" logs/vectorization.log
```

### 4. **系统健康检查**
```bash
# 查看最新监控结果
cat logs/latest_monitoring_result.json | jq '.system_health'

# 查看警报
cat logs/latest_monitoring_result.json | jq '.alerts'
```

## 🔍 **调试指南**

### 1. **文件上传问题调试**

#### **步骤1: 检查上传日志**
```bash
grep "🚀 开始文件上传会话" logs/upload.log | tail -5
```

#### **步骤2: 跟踪特定会话**
```bash
# 使用会话ID跟踪整个流程
grep "upload_20231201_143022" logs/upload.log
```

#### **步骤3: 检查错误详情**
```bash
grep "❌" logs/upload.log | tail -10
```

### 2. **认证问题调试**

#### **步骤1: 检查token验证**
```bash
grep "Token验证\|🎫" logs/auth.log | tail -10
```

#### **步骤2: 查看用户创建/更新**
```bash
grep "用户创建\|用户更新" logs/auth.log | tail -5
```

### 3. **向量化问题调试**

#### **步骤1: 检查模型状态**
```bash
grep "模型加载" logs/vectorization.log | tail -3
```

#### **步骤2: 分析失败原因**
```bash
grep "向量化异常\|❌" logs/vectorization.log | tail -10
```

#### **步骤3: 检查Qdrant连接**
```bash
grep "Qdrant\|🗄️" logs/vectorization.log | tail -10
```

## 📈 **性能监控指标**

### 1. **关键性能指标 (KPI)**
- **文件上传成功率**: `successful_uploads / total_uploads`
- **向量化成功率**: `vectorized_documents / uploaded_documents`
- **平均处理时间**: 从日志中提取 `耗时: X.XX秒`
- **认证成功率**: `auth_successes / total_auth_attempts`

### 2. **系统健康指标**
- **CPU使用率**: 系统监控报告
- **内存使用率**: 系统监控报告
- **磁盘空间**: 系统监控报告
- **日志文件大小**: 防止日志过大

### 3. **错误趋势分析**
```bash
# 每日错误统计
grep "$(date '+%Y-%m-%d')" logs/error.log | wc -l

# 错误类型分布
grep "❌" logs/*.log | cut -d':' -f3 | sort | uniq -c | sort -nr
```

## ⚠️ **注意事项**

### 1. **性能影响**
- 详细日志会增加I/O开销
- 生产环境可调整为INFO级别
- 定期清理旧日志文件

### 2. **隐私保护**
- 所有敏感信息已自动脱敏
- Token只显示前后缀
- 邮箱地址部分隐藏

### 3. **存储管理**
- 日志文件自动轮转（10MB/文件）
- 保留最近5个备份
- 监控日志目录大小

### 4. **依赖管理**
- 需要安装 `psutil` 库
- 可选安装 `python-json-logger`
- 确保有足够的磁盘空间

## 🔧 **自定义配置**

### 1. **调整日志级别**
```python
# 在logging_config.py中修改
'loggers': {
    'upload': {
        'level': 'INFO',  # 改为INFO减少日志量
        # ...
    }
}
```

### 2. **添加自定义监控指标**
```python
# 在system_monitor.py中扩展
def _collect_custom_metrics(self):
    # 添加业务特定的监控指标
    pass
```

### 3. **配置警报阈值**
```python
# 在system_monitor.py中调整
if health['cpu_usage'] > 70:  # 降低阈值
    health['overall_status'] = 'warning'
```

## 📞 **故障排除**

### 1. **常见问题**

#### **Q: 日志文件未生成**
**A**: 检查logs目录权限，确保应用有写入权限

#### **Q: 监控脚本报错**
**A**: 确保安装了psutil库：`pip install psutil`

#### **Q: 日志量过大**
**A**: 调整日志级别为INFO或WARNING

#### **Q: 性能下降**
**A**: 检查日志装饰器使用，考虑移除性能敏感函数的详细日志

### 2. **联系支持**
如遇到问题，请提供：
- 错误日志片段
- 系统监控报告
- 复现步骤
- 环境信息

---

## 📋 **总结**

这套调试日志系统为ChatGPTFirewall提供了：

✅ **完整的流程跟踪**: 从文件上传到向量化的每个步骤  
✅ **实时系统监控**: 自动检测异常和性能问题  
✅ **详细的错误诊断**: 快速定位问题根源  
✅ **性能分析工具**: 优化系统瓶颈  
✅ **自动化警报**: 及时发现潜在问题  

通过这套系统，您可以：
- 快速诊断生产环境问题
- 监控系统健康状态
- 分析用户行为模式
- 优化系统性能
- 提升用户体验

开始使用这套调试系统，让您的ChatGPTFirewall运行得更加稳定和高效！ 