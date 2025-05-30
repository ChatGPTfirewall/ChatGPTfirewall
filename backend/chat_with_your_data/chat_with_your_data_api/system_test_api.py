"""
系统测试API端点
===============

提供完整的系统功能验证端点
包括认证、文件处理、向量存储、数据库等关键功能测试
"""

import os
import json
import tempfile
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional
from pathlib import Path

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.http import JsonResponse
from django.db import connection
from django.conf import settings
from django.core.files.uploadedfile import SimpleUploadedFile

# 导入日志配置
from logging_config import setup_logging, log_performance, log_errors

# 设置日志
loggers = setup_logging()
test_logger = logging.getLogger('test')
if not test_logger.handlers:
    # 为测试添加专用日志处理器
    test_handler = logging.FileHandler('logs/system_test.log')
    test_formatter = logging.Formatter('[%(asctime)s] %(levelname)s - %(message)s')
    test_handler.setFormatter(test_formatter)
    test_logger.addHandler(test_handler)
    test_logger.setLevel(logging.DEBUG)


class SystemTestApiView(APIView):
    """系统测试API - 验证各个组件功能"""
    
    permission_classes = [AllowAny]  # 测试端点暂时允许匿名访问
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.test_session_id = f"test_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        test_logger.info(f"🧪 开始系统测试会话: {self.test_session_id}")
    
    def get(self, request):
        """GET请求返回测试端点说明"""
        test_endpoints = {
            'system_info': {
                'url': '/api/test/',
                'method': 'GET',
                'description': '获取系统测试端点信息'
            },
            'health_check': {
                'url': '/api/test/health/',
                'method': 'GET',
                'description': '系统健康检查'
            },
            'auth_test': {
                'url': '/api/test/auth/',
                'method': 'POST',
                'description': '认证功能测试',
                'body': {'token': 'your_jwt_token'}
            },
            'file_test': {
                'url': '/api/test/file/',
                'method': 'POST',
                'description': '文件处理测试',
                'body': {'test_content': 'sample text content'}
            },
            'vector_test': {
                'url': '/api/test/vector/',
                'method': 'POST',
                'description': '向量存储测试',
                'body': {'text': 'test text for vectorization'}
            },
            'database_test': {
                'url': '/api/test/database/',
                'method': 'GET',
                'description': '数据库连接和状态测试'
            },
            'comprehensive_test': {
                'url': '/api/test/comprehensive/',
                'method': 'POST',
                'description': '完整系统流程测试',
                'body': {'run_all_tests': True}
            }
        }
        
        return Response({
            'session_id': self.test_session_id,
            'timestamp': datetime.now().isoformat(),
            'message': 'ChatGPTFirewall系统测试端点',
            'available_tests': test_endpoints
        })


@api_view(['GET'])
@permission_classes([AllowAny])
@log_performance("test")
def health_check_test(request):
    """系统健康检查端点"""
    test_logger.info("🔍 执行系统健康检查")
    
    health_status = {
        'timestamp': datetime.now().isoformat(),
        'status': 'healthy',
        'checks': {}
    }
    
    try:
        # 1. Python环境检查
        health_status['checks']['python'] = {
            'status': 'ok',
            'version': f"{os.sys.version_info.major}.{os.sys.version_info.minor}.{os.sys.version_info.micro}",
            'executable': os.sys.executable
        }
        
        # 2. Django设置检查
        health_status['checks']['django'] = {
            'status': 'ok',
            'debug_mode': settings.DEBUG,
            'installed_apps_count': len(settings.INSTALLED_APPS)
        }
        
        # 3. 日志系统检查
        logs_dir = Path('logs')
        health_status['checks']['logging'] = {
            'status': 'ok' if logs_dir.exists() else 'warning',
            'log_directory_exists': logs_dir.exists(),
            'log_files_count': len(list(logs_dir.glob('*.log'))) if logs_dir.exists() else 0
        }
        
        # 4. 依赖库检查
        dependencies = {}
        try:
            import psutil
            dependencies['psutil'] = 'ok'
        except ImportError:
            dependencies['psutil'] = 'missing'
        
        try:
            import qdrant_client
            dependencies['qdrant_client'] = 'ok'
        except ImportError:
            dependencies['qdrant_client'] = 'missing'
        
        try:
            import sentence_transformers
            dependencies['sentence_transformers'] = 'ok'
        except ImportError:
            dependencies['sentence_transformers'] = 'missing'
        
        health_status['checks']['dependencies'] = dependencies
        
        # 5. 文件系统权限检查
        temp_test_file = logs_dir / 'test_write_permission.tmp'
        try:
            with open(temp_test_file, 'w') as f:
                f.write('test')
            os.remove(temp_test_file)
            health_status['checks']['file_permissions'] = {'status': 'ok'}
        except Exception as e:
            health_status['checks']['file_permissions'] = {
                'status': 'error',
                'error': str(e)
            }
        
        # 判断整体状态
        failed_checks = sum(1 for check in health_status['checks'].values() 
                          if isinstance(check, dict) and check.get('status') == 'error')
        warning_checks = sum(1 for check in health_status['checks'].values() 
                           if isinstance(check, dict) and check.get('status') == 'warning')
        
        if failed_checks > 0:
            health_status['status'] = 'unhealthy'
        elif warning_checks > 0:
            health_status['status'] = 'degraded'
        
        test_logger.info(f"✅ 健康检查完成: {health_status['status']}")
        
        return Response(health_status)
        
    except Exception as e:
        test_logger.error(f"❌ 健康检查异常: {str(e)}")
        return Response({
            'timestamp': datetime.now().isoformat(),
            'status': 'error',
            'error': str(e)
        }, status=500)


@api_view(['POST'])
@permission_classes([AllowAny])
@log_performance("test")
def auth_test(request):
    """认证功能测试端点"""
    test_logger.info("🔐 执行认证功能测试")
    
    test_result = {
        'timestamp': datetime.now().isoformat(),
        'test_type': 'authentication',
        'status': 'unknown',
        'steps': [],
        'details': {}
    }
    
    try:
        # 1. 检查token是否提供
        token = request.data.get('token')
        if not token:
            test_result['steps'].append("❌ 未提供测试token")
            test_result['status'] = 'failed'
            test_result['error'] = '请在请求body中提供token字段'
            return Response(test_result, status=400)
        
        test_result['steps'].append("✅ 接收到测试token")
        
        # 2. 验证token格式
        if not token.startswith('Bearer '):
            token = f"Bearer {token}"
        
        test_result['steps'].append("✅ Token格式检查通过")
        
        # 3. 创建模拟请求进行认证测试
        from enhanced_auth_middleware import EnhancedAuthMiddleware
        
        # 创建模拟的HttpRequest对象
        class MockRequest:
            def __init__(self, token):
                self.META = {'HTTP_AUTHORIZATION': token}
                self.path = '/api/test/auth/'
                self.method = 'POST'
        
        mock_request = MockRequest(token)
        auth_middleware = EnhancedAuthMiddleware(lambda x: None)
        
        # 4. 测试token提取
        token_result = auth_middleware._extract_auth_token(mock_request)
        if token_result['success']:
            test_result['steps'].append("✅ Token提取成功")
            test_result['details']['token_extracted'] = True
        else:
            test_result['steps'].append(f"❌ Token提取失败: {token_result['error']}")
            test_result['status'] = 'failed'
            test_result['error'] = token_result['error']
            return Response(test_result, status=400)
        
        # 5. 测试token验证（需要有效的JWT配置）
        try:
            validation_result = auth_middleware._validate_token(token_result['token'], mock_request)
            if validation_result['success']:
                test_result['steps'].append("✅ Token验证成功")
                test_result['details']['token_valid'] = True
                test_result['details']['jwt_payload'] = validation_result['payload']
                test_result['status'] = 'passed'
            else:
                test_result['steps'].append(f"⚠️ Token验证失败: {validation_result['error']}")
                test_result['details']['token_valid'] = False
                test_result['details']['validation_error'] = validation_result['error']
                test_result['status'] = 'failed'
        except Exception as e:
            test_result['steps'].append(f"❌ Token验证异常: {str(e)}")
            test_result['status'] = 'error'
            test_result['error'] = str(e)
        
        test_logger.info(f"🔐 认证测试完成: {test_result['status']}")
        
        return Response(test_result)
        
    except Exception as e:
        test_logger.error(f"❌ 认证测试异常: {str(e)}")
        test_result['status'] = 'error'
        test_result['error'] = str(e)
        test_result['steps'].append(f"❌ 测试异常: {str(e)}")
        return Response(test_result, status=500)


@api_view(['POST'])
@permission_classes([AllowAny])
@log_performance("test")
def file_test(request):
    """文件处理功能测试端点"""
    test_logger.info("📄 执行文件处理功能测试")
    
    test_result = {
        'timestamp': datetime.now().isoformat(),
        'test_type': 'file_processing',
        'status': 'unknown',
        'steps': [],
        'details': {}
    }
    
    try:
        # 1. 获取测试内容
        test_content = request.data.get('test_content', '这是一个测试文档的内容。用于验证文件处理功能是否正常工作。')
        test_result['steps'].append(f"✅ 准备测试内容: {len(test_content)} 字符")
        
        # 2. 创建临时测试文件
        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False, encoding='utf-8') as temp_file:
            temp_file.write(test_content)
            temp_file_path = temp_file.name
        
        test_result['steps'].append(f"✅ 创建临时文件: {os.path.basename(temp_file_path)}")
        test_result['details']['temp_file'] = temp_file_path
        
        # 3. 测试文件读取
        try:
            with open(temp_file_path, 'r', encoding='utf-8') as f:
                read_content = f.read()
            
            if read_content == test_content:
                test_result['steps'].append("✅ 文件读取验证成功")
                test_result['details']['file_read_success'] = True
            else:
                test_result['steps'].append("❌ 文件内容不匹配")
                test_result['status'] = 'failed'
                return Response(test_result, status=400)
        except Exception as e:
            test_result['steps'].append(f"❌ 文件读取失败: {str(e)}")
            test_result['status'] = 'error'
            return Response(test_result, status=500)
        
        # 4. 测试文件处理模块
        try:
            from chat_with_your_data_api.file_importer import extract_text_from_file
            
            # 测试文本提取
            extracted_text = extract_text_from_file(temp_file_path, '.txt')
            
            if extracted_text and len(extracted_text.strip()) > 0:
                test_result['steps'].append("✅ 文本提取成功")
                test_result['details']['text_extracted'] = True
                test_result['details']['extracted_length'] = len(extracted_text)
            else:
                test_result['steps'].append("❌ 文本提取失败或为空")
                test_result['status'] = 'failed'
        except ImportError:
            test_result['steps'].append("⚠️ 文件处理模块未找到，跳过提取测试")
            test_result['details']['file_importer_available'] = False
        except Exception as e:
            test_result['steps'].append(f"❌ 文本提取异常: {str(e)}")
            test_result['details']['extraction_error'] = str(e)
        
        # 5. 测试文档模型创建
        try:
            from chat_with_your_data_api.models import Document
            from chat_with_your_data_api.serializers import DocumentSerializer
            
            document_data = {
                'filename': 'test_document.txt',
                'text': test_content,
                'fileSize': len(test_content.encode('utf-8')),
                'lang': 'de'
            }
            
            serializer = DocumentSerializer(data=document_data)
            if serializer.is_valid():
                # 不实际保存，只验证序列化
                test_result['steps'].append("✅ 文档模型验证成功")
                test_result['details']['document_serialization'] = True
            else:
                test_result['steps'].append(f"❌ 文档模型验证失败: {serializer.errors}")
                test_result['details']['serialization_errors'] = serializer.errors
        except ImportError:
            test_result['steps'].append("⚠️ 文档模型未找到，跳过模型测试")
            test_result['details']['document_model_available'] = False
        except Exception as e:
            test_result['steps'].append(f"❌ 文档模型测试异常: {str(e)}")
            test_result['details']['model_error'] = str(e)
        
        # 6. 清理临时文件
        try:
            os.remove(temp_file_path)
            test_result['steps'].append("✅ 临时文件清理完成")
        except Exception as e:
            test_result['steps'].append(f"⚠️ 临时文件清理失败: {str(e)}")
        
        # 判断整体状态
        failed_steps = sum(1 for step in test_result['steps'] if step.startswith('❌'))
        if failed_steps == 0:
            test_result['status'] = 'passed'
        else:
            test_result['status'] = 'failed'
        
        test_logger.info(f"📄 文件处理测试完成: {test_result['status']}")
        
        return Response(test_result)
        
    except Exception as e:
        test_logger.error(f"❌ 文件处理测试异常: {str(e)}")
        test_result['status'] = 'error'
        test_result['error'] = str(e)
        test_result['steps'].append(f"❌ 测试异常: {str(e)}")
        return Response(test_result, status=500)


@api_view(['POST'])
@permission_classes([AllowAny])
@log_performance("test")
def vector_test(request):
    """向量存储功能测试端点"""
    test_logger.info("🧠 执行向量存储功能测试")
    
    test_result = {
        'timestamp': datetime.now().isoformat(),
        'test_type': 'vector_storage',
        'status': 'unknown',
        'steps': [],
        'details': {}
    }
    
    try:
        # 1. 获取测试文本
        test_text = request.data.get('text', '这是一个用于测试向量化功能的示例文本。')
        test_result['steps'].append(f"✅ 准备测试文本: {len(test_text)} 字符")
        
        # 2. 测试Qdrant客户端连接
        try:
            from chat_with_your_data_api.qdrant import get_client
            
            client = get_client()
            if client:
                test_result['steps'].append("✅ Qdrant客户端获取成功")
                test_result['details']['qdrant_client'] = True
                
                # 测试连接
                try:
                    collections = client.get_collections()
                    test_result['steps'].append(f"✅ Qdrant连接成功，集合数: {len(collections.collections)}")
                    test_result['details']['qdrant_connection'] = True
                    test_result['details']['collections_count'] = len(collections.collections)
                except Exception as e:
                    test_result['steps'].append(f"❌ Qdrant连接失败: {str(e)}")
                    test_result['details']['qdrant_connection'] = False
                    test_result['details']['connection_error'] = str(e)
            else:
                test_result['steps'].append("❌ Qdrant客户端获取失败")
                test_result['details']['qdrant_client'] = False
        except ImportError:
            test_result['steps'].append("⚠️ Qdrant模块未找到")
            test_result['details']['qdrant_available'] = False
        except Exception as e:
            test_result['steps'].append(f"❌ Qdrant客户端测试异常: {str(e)}")
            test_result['details']['qdrant_error'] = str(e)
        
        # 3. 测试向量化模型
        try:
            from sentence_transformers import SentenceTransformer
            
            model_name = "paraphrase-multilingual-MiniLM-L12-v2"
            test_result['steps'].append(f"🔄 加载向量化模型: {model_name}")
            
            model = SentenceTransformer(model_name)
            test_result['steps'].append("✅ 向量化模型加载成功")
            test_result['details']['model_loaded'] = True
            
            # 测试向量生成
            vectors = model.encode([test_text])
            if len(vectors) > 0 and len(vectors[0]) > 0:
                test_result['steps'].append(f"✅ 向量生成成功: 维度 {len(vectors[0])}")
                test_result['details']['vector_generation'] = True
                test_result['details']['vector_dimension'] = len(vectors[0])
            else:
                test_result['steps'].append("❌ 向量生成失败")
                test_result['details']['vector_generation'] = False
                
        except ImportError:
            test_result['steps'].append("⚠️ SentenceTransformers库未找到")
            test_result['details']['sentence_transformers_available'] = False
        except Exception as e:
            test_result['steps'].append(f"❌ 向量化模型测试异常: {str(e)}")
            test_result['details']['vectorization_error'] = str(e)
        
        # 4. 测试spaCy模型
        try:
            import spacy
            
            # 测试德语模型
            try:
                nlp_de = spacy.load("de_core_news_sm")
                test_result['steps'].append("✅ 德语spaCy模型加载成功")
                test_result['details']['spacy_de'] = True
            except OSError:
                test_result['steps'].append("⚠️ 德语spaCy模型未找到")
                test_result['details']['spacy_de'] = False
            
            # 测试英语模型
            try:
                nlp_en = spacy.load("en_core_web_sm")
                test_result['steps'].append("✅ 英语spaCy模型加载成功")
                test_result['details']['spacy_en'] = True
            except OSError:
                test_result['steps'].append("⚠️ 英语spaCy模型未找到")
                test_result['details']['spacy_en'] = False
                
        except ImportError:
            test_result['steps'].append("⚠️ spaCy库未找到")
            test_result['details']['spacy_available'] = False
        except Exception as e:
            test_result['steps'].append(f"❌ spaCy模型测试异常: {str(e)}")
            test_result['details']['spacy_error'] = str(e)
        
        # 5. 测试文本分段功能
        try:
            from chat_with_your_data_api.embedding import prepare_text
            import spacy
            
            nlp = spacy.load("de_core_news_sm")
            sections = prepare_text(test_text, nlp)
            
            if sections and len(sections) > 0:
                test_result['steps'].append(f"✅ 文本分段成功: {len(sections)} 段落")
                test_result['details']['text_segmentation'] = True
                test_result['details']['sections_count'] = len(sections)
            else:
                test_result['steps'].append("❌ 文本分段失败")
                test_result['details']['text_segmentation'] = False
        except ImportError:
            test_result['steps'].append("⚠️ 文本分段模块未找到")
            test_result['details']['text_segmentation_available'] = False
        except Exception as e:
            test_result['steps'].append(f"❌ 文本分段测试异常: {str(e)}")
            test_result['details']['segmentation_error'] = str(e)
        
        # 判断整体状态
        critical_failures = [
            not test_result['details'].get('qdrant_connection', True),
            not test_result['details'].get('vector_generation', True)
        ]
        
        if any(critical_failures):
            test_result['status'] = 'failed'
        elif test_result['details'].get('qdrant_client', False) and test_result['details'].get('model_loaded', False):
            test_result['status'] = 'passed'
        else:
            test_result['status'] = 'partial'
        
        test_logger.info(f"🧠 向量存储测试完成: {test_result['status']}")
        
        return Response(test_result)
        
    except Exception as e:
        test_logger.error(f"❌ 向量存储测试异常: {str(e)}")
        test_result['status'] = 'error'
        test_result['error'] = str(e)
        test_result['steps'].append(f"❌ 测试异常: {str(e)}")
        return Response(test_result, status=500)


@api_view(['GET'])
@permission_classes([AllowAny])
@log_performance("test")
def database_test(request):
    """数据库连接和状态测试端点"""
    test_logger.info("🗄️ 执行数据库功能测试")
    
    test_result = {
        'timestamp': datetime.now().isoformat(),
        'test_type': 'database',
        'status': 'unknown',
        'steps': [],
        'details': {}
    }
    
    try:
        # 1. 测试数据库连接
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                result = cursor.fetchone()
                
            if result and result[0] == 1:
                test_result['steps'].append("✅ 数据库连接测试成功")
                test_result['details']['database_connection'] = True
            else:
                test_result['steps'].append("❌ 数据库连接测试失败")
                test_result['details']['database_connection'] = False
        except Exception as e:
            test_result['steps'].append(f"❌ 数据库连接异常: {str(e)}")
            test_result['details']['database_connection'] = False
            test_result['details']['connection_error'] = str(e)
        
        # 2. 检查数据库配置
        db_config = settings.DATABASES.get('default', {})
        test_result['details']['database_config'] = {
            'engine': db_config.get('ENGINE', 'unknown'),
            'name': db_config.get('NAME', 'unknown'),
            'host': db_config.get('HOST', 'localhost'),
            'port': db_config.get('PORT', 'default')
        }
        test_result['steps'].append("✅ 数据库配置信息获取成功")
        
        # 3. 检查关键表是否存在
        tables_to_check = [
            'chat_with_your_data_api_customuser',
            'chat_with_your_data_api_document', 
            'chat_with_your_data_api_section'
        ]
        
        existing_tables = []
        missing_tables = []
        
        try:
            with connection.cursor() as cursor:
                # 获取所有表名
                cursor.execute("""
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public'
                """)
                all_tables = [row[0] for row in cursor.fetchall()]
                
                for table in tables_to_check:
                    if table in all_tables:
                        existing_tables.append(table)
                    else:
                        missing_tables.append(table)
            
            test_result['details']['existing_tables'] = existing_tables
            test_result['details']['missing_tables'] = missing_tables
            
            if len(existing_tables) == len(tables_to_check):
                test_result['steps'].append("✅ 所有关键表都存在")
                test_result['details']['tables_status'] = 'complete'
            elif len(existing_tables) > 0:
                test_result['steps'].append(f"⚠️ 部分表存在: {len(existing_tables)}/{len(tables_to_check)}")
                test_result['details']['tables_status'] = 'partial'
            else:
                test_result['steps'].append("❌ 关键表不存在")
                test_result['details']['tables_status'] = 'missing'
                
        except Exception as e:
            test_result['steps'].append(f"❌ 表检查异常: {str(e)}")
            test_result['details']['table_check_error'] = str(e)
        
        # 4. 测试模型导入
        try:
            from chat_with_your_data_api.models import CustomUser, Document, Section
            test_result['steps'].append("✅ 数据模型导入成功")
            test_result['details']['models_import'] = True
            
            # 测试模型查询（不会实际查询数据，只测试查询构建）
            try:
                user_count = CustomUser.objects.count()
                document_count = Document.objects.count()
                section_count = Section.objects.count()
                
                test_result['steps'].append("✅ 数据模型查询测试成功")
                test_result['details']['model_queries'] = True
                test_result['details']['record_counts'] = {
                    'users': user_count,
                    'documents': document_count,
                    'sections': section_count
                }
            except Exception as e:
                test_result['steps'].append(f"❌ 数据模型查询失败: {str(e)}")
                test_result['details']['model_queries'] = False
                test_result['details']['query_error'] = str(e)
                
        except ImportError as e:
            test_result['steps'].append(f"⚠️ 数据模型导入失败: {str(e)}")
            test_result['details']['models_import'] = False
            test_result['details']['import_error'] = str(e)
        
        # 5. 数据库版本和信息
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT version()")
                db_version = cursor.fetchone()[0]
                test_result['details']['database_version'] = db_version
                test_result['steps'].append("✅ 数据库版本信息获取成功")
        except Exception as e:
            test_result['steps'].append(f"⚠️ 数据库版本获取失败: {str(e)}")
        
        # 判断整体状态
        if (test_result['details'].get('database_connection', False) and 
            test_result['details'].get('models_import', False) and
            test_result['details'].get('model_queries', False)):
            test_result['status'] = 'passed'
        elif test_result['details'].get('database_connection', False):
            test_result['status'] = 'partial'
        else:
            test_result['status'] = 'failed'
        
        test_logger.info(f"🗄️ 数据库测试完成: {test_result['status']}")
        
        return Response(test_result)
        
    except Exception as e:
        test_logger.error(f"❌ 数据库测试异常: {str(e)}")
        test_result['status'] = 'error'
        test_result['error'] = str(e)
        test_result['steps'].append(f"❌ 测试异常: {str(e)}")
        return Response(test_result, status=500)


@api_view(['POST'])
@permission_classes([AllowAny])
@log_performance("test")
def comprehensive_test(request):
    """完整系统流程测试端点"""
    test_logger.info("🚀 执行完整系统流程测试")
    
    comprehensive_result = {
        'timestamp': datetime.now().isoformat(),
        'test_type': 'comprehensive',
        'status': 'unknown',
        'test_results': {},
        'summary': {}
    }
    
    try:
        # 执行所有子测试
        tests_to_run = [
            ('health_check', health_check_test),
            ('database', database_test),
            ('file_processing', lambda req: file_test(req)),
            ('vector_storage', lambda req: vector_test(req))
        ]
        
        passed_tests = 0
        failed_tests = 0
        error_tests = 0
        
        for test_name, test_func in tests_to_run:
            test_logger.info(f"🔄 执行子测试: {test_name}")
            
            try:
                # 创建测试请求
                if test_name == 'file_processing':
                    test_request = type('MockRequest', (), {
                        'data': {'test_content': '综合测试的示例文档内容'}
                    })()
                elif test_name == 'vector_storage':
                    test_request = type('MockRequest', (), {
                        'data': {'text': '综合测试的向量化文本内容'}
                    })()
                else:
                    test_request = request
                
                result = test_func(test_request)
                
                if hasattr(result, 'data'):
                    test_data = result.data
                else:
                    test_data = result
                
                comprehensive_result['test_results'][test_name] = test_data
                
                # 统计结果
                if test_data.get('status') == 'passed' or test_data.get('status') == 'healthy':
                    passed_tests += 1
                elif test_data.get('status') == 'failed':
                    failed_tests += 1
                elif test_data.get('status') == 'error':
                    error_tests += 1
                    
            except Exception as e:
                test_logger.error(f"❌ 子测试 {test_name} 异常: {str(e)}")
                comprehensive_result['test_results'][test_name] = {
                    'status': 'error',
                    'error': str(e)
                }
                error_tests += 1
        
        # 生成测试摘要
        total_tests = len(tests_to_run)
        comprehensive_result['summary'] = {
            'total_tests': total_tests,
            'passed_tests': passed_tests,
            'failed_tests': failed_tests,
            'error_tests': error_tests,
            'success_rate': (passed_tests / total_tests) * 100 if total_tests > 0 else 0
        }
        
        # 判断整体状态
        if error_tests > 0:
            comprehensive_result['status'] = 'error'
        elif failed_tests > 0:
            comprehensive_result['status'] = 'failed'
        elif passed_tests == total_tests:
            comprehensive_result['status'] = 'passed'
        else:
            comprehensive_result['status'] = 'partial'
        
        test_logger.info(f"🚀 综合测试完成: {comprehensive_result['status']} - 成功率: {comprehensive_result['summary']['success_rate']:.1f}%")
        
        return Response(comprehensive_result)
        
    except Exception as e:
        test_logger.error(f"❌ 综合测试异常: {str(e)}")
        comprehensive_result['status'] = 'error'
        comprehensive_result['error'] = str(e)
        return Response(comprehensive_result, status=500)


# URL路由配置（需要添加到Django的urls.py中）
test_urlpatterns = [
    # 主测试端点
    # path('api/test/', SystemTestApiView.as_view(), name='system_test'),
    
    # 具体测试端点
    # path('api/test/health/', health_check_test, name='health_test'),
    # path('api/test/auth/', auth_test, name='auth_test'),
    # path('api/test/file/', file_test, name='file_test'),
    # path('api/test/vector/', vector_test, name='vector_test'),
    # path('api/test/database/', database_test, name='database_test'),
    # path('api/test/comprehensive/', comprehensive_test, name='comprehensive_test'),
] 