"""
增强版向量化处理 - 带详细日志记录
===============================

在原有向量化流程基础上添加完整的进度跟踪和错误处理
"""

import logging
import time
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple
import numpy as np
from dataclasses import dataclass

# 导入日志配置
from logging_config import setup_logging, log_performance, log_errors

# 设置日志
loggers = setup_logging()
vectorization_logger = loggers['vectorization']
qdrant_logger = loggers['qdrant']


@dataclass
class VectorizationResult:
    """向量化结果数据类"""
    success: bool
    document_id: Optional[int] = None
    sections_created: int = 0
    vectors_stored: int = 0
    processing_time: float = 0.0
    error: Optional[str] = None
    steps: List[str] = None
    
    def __post_init__(self):
        if self.steps is None:
            self.steps = []


class EnhancedVectorizer:
    """增强版向量化处理器 - 带完整日志记录"""
    
    def __init__(self):
        self.vectorization_session_id = None
        self.models_loaded = False
        self._load_models()
    
    @log_performance("vectorization")
    def _load_models(self):
        """加载向量化模型"""
        vectorization_logger.info("🤖 开始加载向量化模型")
        
        try:
            # 加载spaCy模型
            import spacy
            
            self.nlp_de = None
            self.nlp_en = None
            
            try:
                self.nlp_de = spacy.load("de_core_news_sm")
                vectorization_logger.info("✅ 德语spaCy模型加载成功")
            except OSError:
                vectorization_logger.warning("⚠️ 德语spaCy模型未找到")
            
            try:
                self.nlp_en = spacy.load("en_core_web_sm")
                vectorization_logger.info("✅ 英语spaCy模型加载成功")
            except OSError:
                vectorization_logger.warning("⚠️ 英语spaCy模型未找到")
            
            # 加载SentenceTransformer
            from sentence_transformers import SentenceTransformer
            
            model_name = "paraphrase-multilingual-MiniLM-L12-v2"
            vectorization_logger.info(f"🚀 加载SentenceTransformer模型: {model_name}")
            
            self.sentence_model = SentenceTransformer(model_name)
            vectorization_logger.info("✅ SentenceTransformer模型加载成功")
            
            self.models_loaded = True
            vectorization_logger.info("🎉 所有向量化模型加载完成")
            
        except Exception as e:
            vectorization_logger.error(f"❌ 模型加载失败: {str(e)}")
            import traceback
            vectorization_logger.error(f"异常堆栈:\n{traceback.format_exc()}")
            self.models_loaded = False
    
    @log_performance("vectorization", log_args=True)
    def vectorize_document(self, document, language: str = 'de') -> VectorizationResult:
        """向量化文档 - 主入口函数"""
        
        # 生成向量化会话ID
        self.vectorization_session_id = f"vec_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{document.id}"
        
        vectorization_logger.info(f"🚀 开始向量化文档: {self.vectorization_session_id}")
        vectorization_logger.info(f"文档信息: ID={document.id}, 文件名={document.filename}, 语言={language}")
        
        result = VectorizationResult(success=False)
        start_time = time.time()
        
        try:
            # 检查模型是否加载
            if not self.models_loaded:
                vectorization_logger.error(f"❌ 模型未加载: {self.vectorization_session_id}")
                result.error = "向量化模型未加载"
                return result
            
            # 步骤1: 文本预处理
            preprocessed_text = self._preprocess_text(document.text, language, result)
            if not preprocessed_text:
                return result
            
            # 步骤2: 文本分段
            sections = self._segment_text(preprocessed_text, language, result)
            if not sections:
                return result
            
            # 步骤3: 生成向量
            vectors = self._generate_vectors(sections, result)
            if not vectors:
                return result
            
            # 步骤4: 创建Section记录
            section_records = self._create_section_records(document, sections, result)
            if not section_records:
                return result
            
            # 步骤5: 存储到Qdrant
            storage_success = self._store_vectors_to_qdrant(document, section_records, vectors, result)
            if not storage_success:
                return result
            
            # 完成
            result.success = True
            result.document_id = document.id
            result.sections_created = len(section_records)
            result.vectors_stored = len(vectors)
            result.processing_time = time.time() - start_time
            
            vectorization_logger.info(f"✅ 向量化完成: {self.vectorization_session_id}")
            vectorization_logger.info(f"📊 统计: {result.sections_created} 段落, {result.vectors_stored} 向量, 耗时 {result.processing_time:.2f}秒")
            
            return result
            
        except Exception as e:
            result.processing_time = time.time() - start_time
            result.error = str(e)
            vectorization_logger.error(f"❌ 向量化异常: {self.vectorization_session_id} - {str(e)}")
            
            import traceback
            vectorization_logger.error(f"异常堆栈:\n{traceback.format_exc()}")
            
            return result
    
    def _preprocess_text(self, text: str, language: str, result: VectorizationResult) -> Optional[str]:
        """文本预处理"""
        vectorization_logger.debug(f"📝 开始文本预处理: {self.vectorization_session_id}")
        result.steps.append("开始文本预处理")
        
        try:
            if not text or not text.strip():
                vectorization_logger.warning(f"⚠️ 文本为空: {self.vectorization_session_id}")
                result.error = "文本内容为空"
                result.steps.append("文本预处理失败: 内容为空")
                return None
            
            # 记录原始文本统计
            original_length = len(text)
            original_lines = len(text.split('\n'))
            vectorization_logger.debug(f"原始文本: {original_length} 字符, {original_lines} 行")
            
            # 基础清理
            cleaned_text = text.strip()
            
            # 移除过多的空白行
            import re
            cleaned_text = re.sub(r'\n\s*\n\s*\n', '\n\n', cleaned_text)
            
            # 记录清理后的统计
            cleaned_length = len(cleaned_text)
            cleaned_lines = len(cleaned_text.split('\n'))
            vectorization_logger.debug(f"清理后文本: {cleaned_length} 字符, {cleaned_lines} 行")
            
            # 检查文本长度
            min_length = 50  # 最小50字符
            max_length = 1000000  # 最大1MB
            
            if cleaned_length < min_length:
                vectorization_logger.warning(f"⚠️ 文本过短: {self.vectorization_session_id} - {cleaned_length} < {min_length}")
                result.error = f"文本内容过短 ({cleaned_length} 字符)"
                result.steps.append("文本预处理失败: 内容过短")
                return None
            
            if cleaned_length > max_length:
                vectorization_logger.warning(f"⚠️ 文本过长: {self.vectorization_session_id} - {cleaned_length} > {max_length}")
                result.error = f"文本内容过长 ({cleaned_length} 字符)"
                result.steps.append("文本预处理失败: 内容过长")
                return None
            
            vectorization_logger.debug(f"✅ 文本预处理完成: {self.vectorization_session_id}")
            result.steps.append(f"文本预处理成功: {cleaned_length} 字符")
            
            return cleaned_text
            
        except Exception as e:
            vectorization_logger.error(f"❌ 文本预处理异常: {self.vectorization_session_id} - {str(e)}")
            result.error = f"文本预处理失败: {str(e)}"
            result.steps.append(f"文本预处理异常: {str(e)}")
            return None
    
    def _segment_text(self, text: str, language: str, result: VectorizationResult) -> Optional[List[str]]:
        """文本分段"""
        vectorization_logger.debug(f"✂️ 开始文本分段: {self.vectorization_session_id}")
        result.steps.append("开始文本分段")
        
        try:
            # 调用原有的分段逻辑
            from chat_with_your_data_api.embedding import prepare_text
            
            vectorization_logger.debug(f"使用语言模型: {language}")
            
            # 获取对应的spaCy模型
            nlp = None
            if language == 'de' and self.nlp_de:
                nlp = self.nlp_de
            elif language == 'en' and self.nlp_en:
                nlp = self.nlp_en
            elif self.nlp_de:  # 默认使用德语
                nlp = self.nlp_de
                vectorization_logger.warning(f"⚠️ 语言模型不匹配，使用默认德语模型: {language}")
            else:
                vectorization_logger.error(f"❌ 无可用的spaCy模型: {self.vectorization_session_id}")
                result.error = "无可用的语言模型"
                result.steps.append("文本分段失败: 无可用模型")
                return None
            
            # 执行分段
            vectorization_logger.debug(f"🔄 执行文本分段处理...")
            sections = prepare_text(text, nlp)
            
            if not sections:
                vectorization_logger.warning(f"⚠️ 分段结果为空: {self.vectorization_session_id}")
                result.error = "文本分段失败"
                result.steps.append("文本分段失败: 结果为空")
                return None
            
            # 记录分段统计
            section_count = len(sections)
            avg_length = sum(len(s) for s in sections) / section_count if section_count > 0 else 0
            
            vectorization_logger.info(f"✅ 文本分段完成: {self.vectorization_session_id} - {section_count} 段落")
            vectorization_logger.debug(f"分段统计: 平均长度 {avg_length:.1f} 字符")
            
            # 记录每个段落的长度分布
            lengths = [len(s) for s in sections]
            min_len, max_len = min(lengths), max(lengths)
            vectorization_logger.debug(f"段落长度范围: {min_len} - {max_len} 字符")
            
            result.steps.append(f"文本分段成功: {section_count} 段落")
            
            return sections
            
        except Exception as e:
            vectorization_logger.error(f"❌ 文本分段异常: {self.vectorization_session_id} - {str(e)}")
            result.error = f"文本分段失败: {str(e)}"
            result.steps.append(f"文本分段异常: {str(e)}")
            return None
    
    def _generate_vectors(self, sections: List[str], result: VectorizationResult) -> Optional[List[np.ndarray]]:
        """生成向量"""
        vectorization_logger.debug(f"🧠 开始生成向量: {self.vectorization_session_id}")
        result.steps.append("开始生成向量")
        
        try:
            section_count = len(sections)
            vectorization_logger.info(f"📊 生成 {section_count} 个段落的向量")
            
            # 批量生成向量
            vectorization_logger.debug("🔄 SentenceTransformer编码中...")
            start_time = time.time()
            
            vectors = self.sentence_model.encode(sections, show_progress_bar=False, convert_to_numpy=True)
            
            encoding_time = time.time() - start_time
            vectorization_logger.info(f"✅ 向量生成完成: {encoding_time:.2f}秒")
            
            # 检查向量维度
            if len(vectors) != section_count:
                vectorization_logger.error(f"❌ 向量数量不匹配: {self.vectorization_session_id} - {len(vectors)} != {section_count}")
                result.error = "向量生成数量错误"
                result.steps.append("向量生成失败: 数量不匹配")
                return None
            
            # 记录向量统计
            if len(vectors) > 0:
                vector_dim = vectors[0].shape[0]
                vectorization_logger.debug(f"向量维度: {vector_dim}")
                vectorization_logger.debug(f"向量数据类型: {vectors[0].dtype}")
                
                # 检查向量有效性
                for i, vector in enumerate(vectors):
                    if np.isnan(vector).any():
                        vectorization_logger.warning(f"⚠️ 向量 {i} 包含NaN值")
                    if np.isinf(vector).any():
                        vectorization_logger.warning(f"⚠️ 向量 {i} 包含无穷值")
            
            result.steps.append(f"向量生成成功: {len(vectors)} 个向量")
            
            return vectors
            
        except Exception as e:
            vectorization_logger.error(f"❌ 向量生成异常: {self.vectorization_session_id} - {str(e)}")
            result.error = f"向量生成失败: {str(e)}"
            result.steps.append(f"向量生成异常: {str(e)}")
            return None
    
    def _create_section_records(self, document, sections: List[str], result: VectorizationResult) -> Optional[List]:
        """创建Section记录"""
        vectorization_logger.debug(f"📝 创建Section记录: {self.vectorization_session_id}")
        result.steps.append("开始创建Section记录")
        
        try:
            from chat_with_your_data_api.models import Section
            from chat_with_your_data_api.serializers import SectionSerializer
            
            section_records = []
            
            for i, section_text in enumerate(sections):
                vectorization_logger.debug(f"创建Section {i+1}/{len(sections)}")
                
                section_data = {
                    'document': document.id,
                    'section_text': section_text,
                    'section_number': i + 1
                }
                
                serializer = SectionSerializer(data=section_data)
                
                if serializer.is_valid():
                    section_record = serializer.save()
                    section_records.append(section_record)
                    vectorization_logger.debug(f"✅ Section {i+1} 创建成功: ID {section_record.id}")
                else:
                    vectorization_logger.error(f"❌ Section {i+1} 验证失败: {serializer.errors}")
                    result.error = f"Section记录验证失败: {serializer.errors}"
                    result.steps.append(f"Section记录创建失败: 验证错误")
                    return None
            
            vectorization_logger.info(f"✅ Section记录创建完成: {self.vectorization_session_id} - {len(section_records)} 记录")
            result.steps.append(f"Section记录创建成功: {len(section_records)} 记录")
            
            return section_records
            
        except Exception as e:
            vectorization_logger.error(f"❌ Section记录创建异常: {self.vectorization_session_id} - {str(e)}")
            result.error = f"Section记录创建失败: {str(e)}"
            result.steps.append(f"Section记录创建异常: {str(e)}")
            return None
    
    def _store_vectors_to_qdrant(self, document, section_records: List, vectors: List[np.ndarray], result: VectorizationResult) -> bool:
        """存储向量到Qdrant"""
        qdrant_logger.info(f"🗄️ 开始存储向量到Qdrant: {self.vectorization_session_id}")
        result.steps.append("开始存储向量到Qdrant")
        
        try:
            from chat_with_your_data_api.qdrant import get_client
            
            # 获取Qdrant客户端
            client = get_client()
            if not client:
                qdrant_logger.error(f"❌ Qdrant客户端获取失败: {self.vectorization_session_id}")
                result.error = "Qdrant连接失败"
                result.steps.append("向量存储失败: 连接错误")
                return False
            
            # 准备存储数据
            user = document.user
            if not user or not hasattr(user, 'auth0_id'):
                qdrant_logger.error(f"❌ 用户信息缺失: {self.vectorization_session_id}")
                result.error = "用户信息缺失"
                result.steps.append("向量存储失败: 用户信息错误")
                return False
            
            # 提取集合名称
            collection_name = user.auth0_id.split("|")[1] if "|" in user.auth0_id else user.auth0_id
            qdrant_logger.info(f"目标集合: {collection_name}")
            
            # 检查集合是否存在
            collection_exists = self._ensure_collection_exists(client, collection_name, result)
            if not collection_exists:
                return False
            
            # 批量存储向量
            stored_count = 0
            for i, (section_record, vector) in enumerate(zip(section_records, vectors)):
                try:
                    # 构造点数据
                    point_id = section_record.id
                    payload = {
                        'document_id': document.id,
                        'section_id': section_record.id,
                        'filename': document.filename,
                        'section_text': section_record.section_text[:1000],  # 限制载荷大小
                        'section_number': section_record.section_number
                    }
                    
                    # 存储单个向量
                    client.upsert(
                        collection_name=collection_name,
                        points=[{
                            'id': point_id,
                            'vector': vector.tolist(),
                            'payload': payload
                        }]
                    )
                    
                    stored_count += 1
                    qdrant_logger.debug(f"✅ 向量 {i+1} 存储成功: Point ID {point_id}")
                    
                except Exception as e:
                    qdrant_logger.error(f"❌ 向量 {i+1} 存储失败: {str(e)}")
                    # 继续处理其他向量
            
            if stored_count == 0:
                qdrant_logger.error(f"❌ 所有向量存储失败: {self.vectorization_session_id}")
                result.error = "向量存储全部失败"
                result.steps.append("向量存储失败: 全部失败")
                return False
            
            qdrant_logger.info(f"✅ 向量存储完成: {self.vectorization_session_id} - {stored_count}/{len(vectors)} 成功")
            result.steps.append(f"向量存储成功: {stored_count}/{len(vectors)}")
            
            return stored_count > 0
            
        except Exception as e:
            qdrant_logger.error(f"❌ Qdrant存储异常: {self.vectorization_session_id} - {str(e)}")
            result.error = f"向量存储失败: {str(e)}"
            result.steps.append(f"向量存储异常: {str(e)}")
            return False
    
    def _ensure_collection_exists(self, client, collection_name: str, result: VectorizationResult) -> bool:
        """确保集合存在"""
        qdrant_logger.debug(f"🔍 检查集合: {collection_name}")
        
        try:
            from qdrant_client.models import Distance, VectorParams
            
            # 检查集合是否存在
            collections = client.get_collections()
            existing_collections = [col.name for col in collections.collections]
            
            if collection_name in existing_collections:
                qdrant_logger.debug(f"✅ 集合已存在: {collection_name}")
                return True
            
            # 创建新集合
            qdrant_logger.info(f"🔨 创建新集合: {collection_name}")
            
            client.create_collection(
                collection_name=collection_name,
                vectors_config=VectorParams(
                    size=384,  # SentenceTransformer输出维度
                    distance=Distance.COSINE
                )
            )
            
            qdrant_logger.info(f"✅ 集合创建成功: {collection_name}")
            return True
            
        except Exception as e:
            qdrant_logger.error(f"❌ 集合操作失败: {collection_name} - {str(e)}")
            result.error = f"集合操作失败: {str(e)}"
            return False


# 全局向量化器实例
_vectorizer = None

def get_vectorizer() -> EnhancedVectorizer:
    """获取向量化器实例（单例模式）"""
    global _vectorizer
    if _vectorizer is None:
        _vectorizer = EnhancedVectorizer()
    return _vectorizer


def vectorize_document_enhanced(document, language: str = 'de') -> VectorizationResult:
    """增强版文档向量化函数 - 外部接口"""
    vectorizer = get_vectorizer()
    return vectorizer.vectorize_document(document, language) 