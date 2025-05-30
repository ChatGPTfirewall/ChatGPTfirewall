"""
增强版文件上传API - 带详细日志记录
===============================

在原有UploadApiView基础上添加完整的日志跟踪和错误处理
"""

import os
import tempfile
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.files.storage import default_storage
from django.conf import settings

# 导入日志配置
from logging_config import setup_logging, log_performance, log_errors, log_user_action, log_data_validation

# 设置日志
loggers = setup_logging()
upload_logger = loggers['upload']
file_logger = loggers['file_processor']


class EnhancedUploadApiView(APIView):
    """增强版文件上传API - 带完整日志记录"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.upload_session_id = None
    
    @log_user_action("文件上传请求", "upload")
    @log_performance("upload", log_args=False)
    def post(self, request):
        """处理文件上传请求 - 带详细日志"""
        
        # 生成上传会话ID
        self.upload_session_id = f"upload_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{id(request)}"
        upload_logger.info(f"🚀 开始文件上传会话: {self.upload_session_id}")
        
        try:
            # 1. 验证请求
            validation_result = self._validate_request(request)
            if not validation_result['valid']:
                return self._error_response(validation_result['error'], status.HTTP_400_BAD_REQUEST)
            
            # 2. 获取用户信息
            user_info = self._get_user_info(request)
            upload_logger.info(f"👤 用户信息: {user_info}")
            
            # 3. 处理文件上传
            files = request.FILES.getlist('files')
            upload_logger.info(f"📁 接收到 {len(files)} 个文件")
            
            # 记录文件信息
            for i, file in enumerate(files):
                file_logger.info(f"📄 文件 {i+1}: {file.name} ({file.size} bytes, {file.content_type})")
            
            # 4. 处理每个文件
            results = []
            successful_uploads = 0
            failed_uploads = 0
            
            for i, file in enumerate(files):
                file_result = self._process_single_file(file, user_info, i+1, len(files))
                results.append(file_result)
                
                if file_result['success']:
                    successful_uploads += 1
                else:
                    failed_uploads += 1
            
            # 5. 汇总结果
            upload_logger.info(f"📊 上传汇总: 成功 {successful_uploads}, 失败 {failed_uploads}")
            
            response_data = {
                'session_id': self.upload_session_id,
                'total_files': len(files),
                'successful_uploads': successful_uploads,
                'failed_uploads': failed_uploads,
                'results': results,
                'timestamp': datetime.now().isoformat()
            }
            
            upload_logger.info(f"✅ 文件上传会话完成: {self.upload_session_id}")
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            upload_logger.error(f"❌ 上传会话异常: {self.upload_session_id} - {str(e)}")
            import traceback
            upload_logger.error(f"异常堆栈:\n{traceback.format_exc()}")
            return self._error_response(f"系统错误: {str(e)}", status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _validate_request(self, request) -> Dict[str, Any]:
        """验证上传请求"""
        upload_logger.debug("🔍 开始验证上传请求")
        
        # 检查文件是否存在
        if 'files' not in request.FILES:
            upload_logger.warning("⚠️ 请求中未找到文件")
            return {'valid': False, 'error': '未找到上传文件'}
        
        files = request.FILES.getlist('files')
        if not files:
            upload_logger.warning("⚠️ 文件列表为空")
            return {'valid': False, 'error': '文件列表为空'}
        
        # 检查文件数量限制
        max_files = getattr(settings, 'MAX_UPLOAD_FILES', 10)
        if len(files) > max_files:
            upload_logger.warning(f"⚠️ 文件数量超限: {len(files)} > {max_files}")
            return {'valid': False, 'error': f'文件数量超过限制 ({max_files})'}
        
        # 检查每个文件
        allowed_extensions = {'.pdf', '.docx', '.doc', '.txt', '.rtf', '.html', '.xml', '.csv', '.md'}
        max_size = getattr(settings, 'MAX_UPLOAD_SIZE', 50 * 1024 * 1024)  # 50MB
        
        for i, file in enumerate(files):
            # 检查文件扩展名
            file_ext = os.path.splitext(file.name)[1].lower()
            if file_ext not in allowed_extensions:
                upload_logger.warning(f"⚠️ 文件 {i+1} 格式不支持: {file_ext}")
                return {'valid': False, 'error': f'不支持的文件格式: {file_ext}'}
            
            # 检查文件大小
            if file.size > max_size:
                size_mb = file.size / (1024 * 1024)
                max_mb = max_size / (1024 * 1024)
                upload_logger.warning(f"⚠️ 文件 {i+1} 过大: {size_mb:.1f}MB > {max_mb:.1f}MB")
                return {'valid': False, 'error': f'文件过大: {file.name} ({size_mb:.1f}MB)'}
        
        upload_logger.debug("✅ 请求验证通过")
        return {'valid': True}
    
    def _get_user_info(self, request) -> Dict[str, Any]:
        """获取用户信息"""
        upload_logger.debug("👤 获取用户信息")
        
        user_info = {
            'authenticated': False,
            'user_id': None,
            'username': None,
            'auth0_id': None,
            'language': 'de'  # 默认语言
        }
        
        if hasattr(request, 'user') and request.user:
            user_info['authenticated'] = True
            
            if hasattr(request.user, 'id'):
                user_info['user_id'] = request.user.id
            
            if hasattr(request.user, 'username'):
                user_info['username'] = request.user.username
            
            if hasattr(request.user, 'auth0_id'):
                user_info['auth0_id'] = request.user.auth0_id
            
            if hasattr(request.user, 'lang'):
                user_info['language'] = request.user.lang
        
        upload_logger.debug(f"用户信息: {user_info}")
        return user_info
    
    @log_performance("upload")
    def _process_single_file(self, file, user_info: Dict, file_index: int, total_files: int) -> Dict[str, Any]:
        """处理单个文件上传"""
        file_logger.info(f"🔄 处理文件 {file_index}/{total_files}: {file.name}")
        
        file_result = {
            'filename': file.name,
            'size': file.size,
            'content_type': file.content_type,
            'success': False,
            'document_id': None,
            'vectorized': False,
            'error': None,
            'processing_time': None,
            'steps': []
        }
        
        start_time = datetime.now()
        
        try:
            # 步骤1: 保存临时文件
            temp_file_path = self._save_temp_file(file, file_result)
            if not temp_file_path:
                return file_result
            
            # 步骤2: 提取文本内容
            text_content = self._extract_text_content(temp_file_path, file, file_result)
            if not text_content:
                self._cleanup_temp_file(temp_file_path)
                return file_result
            
            # 步骤3: 创建文档记录
            document = self._create_document_record(file, text_content, user_info, file_result)
            if not document:
                self._cleanup_temp_file(temp_file_path)
                return file_result
            
            # 步骤4: 向量化处理
            vectorization_success = self._vectorize_document(document, user_info, file_result)
            
            # 步骤5: 清理临时文件
            self._cleanup_temp_file(temp_file_path)
            
            # 计算处理时间
            processing_time = (datetime.now() - start_time).total_seconds()
            file_result['processing_time'] = processing_time
            
            if vectorization_success:
                file_result['success'] = True
                file_result['document_id'] = document.id
                file_result['vectorized'] = True
                file_logger.info(f"✅ 文件处理成功: {file.name} (ID: {document.id}, 耗时: {processing_time:.2f}秒)")
            else:
                file_logger.warning(f"⚠️ 文件处理部分成功: {file.name} - 向量化失败")
            
        except Exception as e:
            processing_time = (datetime.now() - start_time).total_seconds()
            file_result['processing_time'] = processing_time
            file_result['error'] = str(e)
            file_logger.error(f"❌ 文件处理失败: {file.name} - {str(e)} (耗时: {processing_time:.2f}秒)")
            
            import traceback
            file_logger.error(f"异常详情:\n{traceback.format_exc()}")
        
        return file_result
    
    def _save_temp_file(self, file, file_result: Dict) -> Optional[str]:
        """保存临时文件"""
        file_logger.debug(f"💾 保存临时文件: {file.name}")
        file_result['steps'].append("开始保存临时文件")
        
        try:
            # 创建临时文件
            temp_dir = tempfile.gettempdir()
            file_ext = os.path.splitext(file.name)[1]
            temp_file_path = os.path.join(temp_dir, f"upload_{self.upload_session_id}_{file.name}")
            
            # 保存文件
            with open(temp_file_path, 'wb') as temp_file:
                for chunk in file.chunks():
                    temp_file.write(chunk)
            
            file_logger.debug(f"✅ 临时文件已保存: {temp_file_path}")
            file_result['steps'].append("临时文件保存成功")
            return temp_file_path
            
        except Exception as e:
            file_logger.error(f"❌ 保存临时文件失败: {file.name} - {str(e)}")
            file_result['error'] = f"保存临时文件失败: {str(e)}"
            file_result['steps'].append(f"临时文件保存失败: {str(e)}")
            return None
    
    def _extract_text_content(self, temp_file_path: str, file, file_result: Dict) -> Optional[str]:
        """提取文本内容"""
        file_logger.debug(f"📄 提取文本内容: {file.name}")
        file_result['steps'].append("开始提取文本内容")
        
        try:
            # 这里应该调用原来的文件处理逻辑
            # 为了演示，简化处理
            file_ext = os.path.splitext(file.name)[1].lower()
            
            if file_ext == '.txt':
                with open(temp_file_path, 'r', encoding='utf-8') as f:
                    text_content = f.read()
            else:
                # 调用原来的 file_importer 逻辑
                from chat_with_your_data_api.file_importer import extract_text_from_file
                text_content = extract_text_from_file(temp_file_path, file_ext)
            
            if text_content and len(text_content.strip()) > 0:
                text_length = len(text_content)
                word_count = len(text_content.split())
                file_logger.info(f"✅ 文本提取成功: {file.name} - {text_length} 字符, {word_count} 词")
                file_result['steps'].append(f"文本提取成功: {text_length} 字符")
                return text_content
            else:
                file_logger.warning(f"⚠️ 提取的文本为空: {file.name}")
                file_result['error'] = "提取的文本内容为空"
                file_result['steps'].append("文本提取失败: 内容为空")
                return None
                
        except Exception as e:
            file_logger.error(f"❌ 文本提取失败: {file.name} - {str(e)}")
            file_result['error'] = f"文本提取失败: {str(e)}"
            file_result['steps'].append(f"文本提取失败: {str(e)}")
            return None
    
    def _create_document_record(self, file, text_content: str, user_info: Dict, file_result: Dict):
        """创建文档记录"""
        file_logger.debug(f"📝 创建文档记录: {file.name}")
        file_result['steps'].append("开始创建文档记录")
        
        try:
            from chat_with_your_data_api.serializers import DocumentSerializer
            
            document_data = {
                'filename': file.name,
                'text': text_content,
                'fileSize': file.size,
                'lang': user_info.get('language', 'de'),
                'user': user_info.get('user_id')
            }
            
            serializer = DocumentSerializer(data=document_data)
            
            if serializer.is_valid():
                document = serializer.save()
                file_logger.info(f"✅ 文档记录创建成功: {file.name} (ID: {document.id})")
                file_result['steps'].append(f"文档记录创建成功: ID {document.id}")
                return document
            else:
                error_msg = f"文档数据验证失败: {serializer.errors}"
                file_logger.error(f"❌ {error_msg}")
                file_result['error'] = error_msg
                file_result['steps'].append(f"文档记录创建失败: 验证错误")
                return None
                
        except Exception as e:
            file_logger.error(f"❌ 创建文档记录失败: {file.name} - {str(e)}")
            file_result['error'] = f"创建文档记录失败: {str(e)}"
            file_result['steps'].append(f"文档记录创建失败: {str(e)}")
            return None
    
    def _vectorize_document(self, document, user_info: Dict, file_result: Dict) -> bool:
        """向量化文档"""
        file_logger.info(f"🧠 开始向量化: {document.filename}")
        file_result['steps'].append("开始向量化处理")
        
        try:
            from chat_with_your_data_api.qdrant import insert_text
            
            # 提取用户ID
            auth0_id = user_info.get('auth0_id')
            if not auth0_id:
                file_logger.error("❌ 向量化失败: 缺少用户Auth0 ID")
                file_result['error'] = "向量化失败: 缺少用户ID"
                file_result['steps'].append("向量化失败: 缺少用户ID")
                return False
            
            # 提取集合名称
            collection_name = auth0_id.split("|")[1] if "|" in auth0_id else auth0_id
            
            # 执行向量化
            vectorization_logger = logging.getLogger('vectorization')
            vectorization_logger.info(f"🚀 开始向量化文档: {document.filename} -> 集合: {collection_name}")
            
            qdrant_result = insert_text(collection_name, document, user_info.get('language', 'de'))
            
            if qdrant_result:
                vectorization_logger.info(f"✅ 向量化成功: {document.filename}")
                file_result['steps'].append("向量化处理成功")
                return True
            else:
                vectorization_logger.error(f"❌ 向量化失败: {document.filename}")
                file_result['error'] = "向量化处理失败"
                file_result['steps'].append("向量化处理失败")
                return False
                
        except Exception as e:
            vectorization_logger = logging.getLogger('vectorization')
            vectorization_logger.error(f"❌ 向量化异常: {document.filename} - {str(e)}")
            file_result['error'] = f"向量化异常: {str(e)}"
            file_result['steps'].append(f"向量化异常: {str(e)}")
            return False
    
    def _cleanup_temp_file(self, temp_file_path: str):
        """清理临时文件"""
        try:
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
                file_logger.debug(f"🗑️ 临时文件已清理: {temp_file_path}")
        except Exception as e:
            file_logger.warning(f"⚠️ 清理临时文件失败: {temp_file_path} - {str(e)}")
    
    def _error_response(self, error_message: str, status_code: int) -> Response:
        """生成错误响应"""
        upload_logger.error(f"❌ 请求失败: {error_message}")
        
        error_data = {
            'session_id': self.upload_session_id,
            'success': False,
            'error': error_message,
            'timestamp': datetime.now().isoformat()
        }
        
        return Response(error_data, status=status_code) 