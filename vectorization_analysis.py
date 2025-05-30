"""
向量化处理流程深度分析
===================

## 📊 **向量化流程现状分析**

### 🔄 **1. 触发机制分析**

#### 向量化触发点：
```python
# 在 UploadApiView.post() 中：
serializer = DocumentSerializer(data=document_data)
if serializer.is_valid():
    result = serializer.save()  # 1. 保存到PostgreSQL
    documents.append(serializer.data)
    
    [_, id] = user.auth0_id.split("|")  # 2. 提取用户ID
    qdrant_result = insert_text(id, result, user.lang)  # 3. 触发向量化
    if not qdrant_result:  # 4. 检查是否成功
        success = False
        break
```

#### ✅ **触发机制正确性**：
- **正确**: 文档成功保存到数据库后立即触发向量化
- **正确**: 使用用户ID作为collection_name进行隔离
- **正确**: 传递用户语言进行正确的文本处理

#### ⚠️ **潜在问题**：
1. **同步处理**: 向量化在主线程中执行，可能导致请求超时
2. **无重试机制**: 向量化失败后不会重试
3. **部分失败处理**: 多文件上传时，一个失败会导致所有回滚

---

### 🧠 **2. 向量化处理链路异常分析**

#### 处理流程：
```
文档文本 → embed_text() → prepare_text() → 分段循环 → vectorize() → 存储到Qdrant
    ↓           ↓            ↓           ↓          ↓            ↓
   原始文本   spaCy处理    句子分割   内容清理   向量生成    批量插入
```

#### 🚨 **各环节异常风险**：

**1. embed_text() 异常：**
```python
# 可能异常：
- 不支持的语言（只支持de/en）
- spaCy模型加载失败
- 内存不足处理大文档
- 特殊字符导致解析错误
```

**2. prepare_text() 异常：**
```python
# 可能异常：
- 空文档或无有效句子
- 句子分割异常
- 内存溢出（大文档）
```

**3. 分段处理异常：**
```python
# 每个token处理中：
for i, token in enumerate(tokens):
    content = clean_join(token)  # 可能异常：正则表达式错误
    section = {"document": document.id, "content": content, "doc_index": i}
    serializer = SectionSerializer(data=section)
    if serializer.is_valid():
        result = serializer.save()  # 可能异常：数据库错误
    else:
        return serializer.errors  # 返回错误但不是布尔值
```

**4. vectorize() 异常：**
```python
# 可能异常：
- SentenceTransformer模型错误
- GPU内存不足
- 输入文本过长
- 网络连接问题（模型下载）
```

**5. Qdrant存储异常：**
```python
# __insert_points() 中：
__client.upsert(collection_name=collection_name, points=points)
# 可能异常：
- 网络连接失败
- 集合不存在
- 向量维度不匹配
- 存储空间不足
- 批量大小超限
```

---

### 🔍 **3. 验证机制缺陷分析**

#### ❌ **当前验证问题**：

**1. 返回值不一致**：
```python
# insert_text() 返回值混乱：
if serializer.is_valid():
    result = serializer.save()
else:
    return serializer.errors  # 返回错误对象

# 最后：
return True  # 总是返回True
```

**2. 无验证机制**：
```python
# 没有验证：
- Qdrant集合是否存在
- 向量是否成功插入
- 插入的向量数量是否正确
- 向量维度是否匹配
```

**3. 错误信息丢失**：
```python
# 所有异常都被忽略，只返回简单的True/False
qdrant_result = insert_text(id, result, user.lang)
if not qdrant_result:  # 无法知道具体失败原因
    success = False
```

---

### 🧪 **4. 验证文件向量化的方法**

#### **方法1: 通过Section表验证**
```python
# 检查数据库中的Section记录
from chat_with_your_data_api.models import Document, Section

document = Document.objects.get(id=document_id)
sections = Section.objects.filter(document=document)

print(f"文档: {document.filename}")
print(f"预期段落数: {len(document.text.split('.'))}")  # 粗略估计
print(f"实际段落数: {sections.count()}")
print(f"段落内容示例: {sections.first().content if sections.exists() else '无'}")
```

#### **方法2: 通过搜索验证**
```python
# 使用文档内容进行搜索测试
from chat_with_your_data_api.qdrant import search
from chat_with_your_data_api.embedding import embed_text, vectorize

# 1. 提取文档中的一句话
test_sentence = document.text.split('.')[0]

# 2. 向量化测试句子
vector = vectorize(test_sentence)

# 3. 在Qdrant中搜索
[_, user_id] = document.user.auth0_id.split("|")
search_results = search(user_id, vector, [document.id])

print(f"搜索结果数量: {len(search_results)}")
for result in search_results:
    print(f"相似度: {result.score}")
    print(f"段落ID: {result.payload.get('section_id')}")
```

#### **方法3: 直接查询Qdrant**
```python
# 需要添加到qdrant.py中的验证函数：
def verify_document_vectorization(collection_name, document_id):
    \"\"\"验证文档是否已正确向量化\"\"\"
    try:
        # 统计该文档的向量数量
        filter = Filter(
            must=[FieldCondition(key="document_id", match=MatchValue(value=document_id))]
        )
        
        # 这需要Qdrant客户端支持count操作
        # result = __client.count(collection_name=collection_name, count_filter=filter)
        
        # 目前只能通过搜索来间接验证
        dummy_vector = [0.0] * int(__collection_vec_size)
        results = __client.search(
            collection_name=collection_name,
            query_vector=dummy_vector,
            limit=1000,  # 获取更多结果
            query_filter=filter
        )
        
        return {
            "document_id": document_id,
            "vector_count": len(results),
            "collection_exists": True
        }
    except Exception as e:
        return {
            "document_id": document_id,
            "vector_count": 0,
            "collection_exists": False,
            "error": str(e)
        }
```

#### **方法4: 创建健康检查API**
```python
# 建议添加到views.py中：
class VectorHealthCheckView(APIView):
    def get(self, request, document_id):
        \"\"\"检查文档向量化状态\"\"\"
        try:
            document = Document.objects.get(id=document_id)
            sections = Section.objects.filter(document=document)
            
            [_, user_id] = document.user.auth0_id.split("|")
            
            # 验证向量存储
            verification = verify_document_vectorization(user_id, document.id)
            
            return Response({
                "document_id": document.id,
                "filename": document.filename,
                "database_sections": sections.count(),
                "qdrant_vectors": verification.get("vector_count", 0),
                "status": "healthy" if sections.count() > 0 and verification.get("vector_count", 0) > 0 else "unhealthy",
                "details": verification
            })
        except Document.DoesNotExist:
            return Response({"error": "Document not found"}, status=404)
```

---

### 🎯 **关键发现总结**

#### ✅ **向量化触发正确**：
- 文件上传后确实会触发向量化处理
- 使用正确的用户ID和语言参数

#### 🚨 **严重问题**：
1. **错误处理缺失**: 所有异常都被静默忽略
2. **验证机制缺失**: 无法确认向量化是否真正成功
3. **返回值混乱**: insert_text()返回值不一致
4. **无重试机制**: 失败后无法重新处理
5. **部分失败影响**: 一个文件失败导致全部回滚

#### 🔧 **推荐验证方法**：
1. **立即验证**: 通过Section表记录数量检查
2. **功能验证**: 使用搜索API测试是否能找到文档内容
3. **深度验证**: 创建专门的健康检查API
4. **监控验证**: 添加日志记录整个向量化过程

#### ⚠️ **当前风险**：
- 用户可能看到上传成功，但实际无法搜索到内容
- 系统问题无法被及时发现
- 数据不一致问题可能长期存在

建议立即实施基础的验证机制和错误处理！
""" 