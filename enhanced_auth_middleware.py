"""
增强版认证中间件 - 带详细日志记录
===============================

在原有认证流程基础上添加完整的日志跟踪和错误处理
"""

import logging
import json
import time
from datetime import datetime
from typing import Dict, Any, Optional

from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
from django.conf import settings

# 导入日志配置
from logging_config import setup_logging, log_performance, log_errors

# 设置日志
loggers = setup_logging()
auth_logger = loggers['auth']


class EnhancedAuthMiddleware(MiddlewareMixin):
    """增强版认证中间件 - 带完整日志记录"""
    
    def __init__(self, get_response):
        self.get_response = get_response
        auth_logger.info("🔐 认证中间件已初始化")
        super().__init__(get_response)
    
    def process_request(self, request):
        """处理请求前的认证检查"""
        # 生成请求ID
        request.auth_session_id = f"auth_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{id(request)}"
        
        auth_logger.debug(f"🔍 开始认证检查: {request.auth_session_id}")
        auth_logger.debug(f"请求路径: {request.path}")
        auth_logger.debug(f"请求方法: {request.method}")
        auth_logger.debug(f"请求IP: {self._get_client_ip(request)}")
        
        # 记录请求头信息（敏感信息脱敏）
        self._log_request_headers(request)
        
        # 检查是否需要认证
        if self._should_skip_auth(request):
            auth_logger.debug(f"⏭️ 跳过认证: {request.path}")
            return None
        
        # 执行认证检查
        auth_result = self._authenticate_request(request)
        
        if not auth_result['success']:
            return self._create_auth_error_response(auth_result, request)
        
        auth_logger.info(f"✅ 认证成功: {request.auth_session_id} - 用户: {auth_result.get('user_info', {}).get('auth0_id', '未知')}")
        return None
    
    def process_response(self, request, response):
        """处理响应后的日志记录"""
        if hasattr(request, 'auth_session_id'):
            auth_logger.debug(f"📤 响应状态: {request.auth_session_id} - {response.status_code}")
            
            # 记录响应时间（如果有的话）
            if hasattr(request, '_auth_start_time'):
                duration = time.time() - request._auth_start_time
                auth_logger.debug(f"⏱️ 认证耗时: {request.auth_session_id} - {duration:.3f}秒")
        
        return response
    
    def process_exception(self, request, exception):
        """处理认证过程中的异常"""
        if hasattr(request, 'auth_session_id'):
            auth_logger.error(f"❌ 认证异常: {request.auth_session_id}")
            auth_logger.error(f"异常类型: {type(exception).__name__}")
            auth_logger.error(f"异常信息: {str(exception)}")
            
            import traceback
            auth_logger.error(f"异常堆栈:\n{traceback.format_exc()}")
        
        return None
    
    def _should_skip_auth(self, request) -> bool:
        """检查是否应该跳过认证"""
        # 公开路径列表
        public_paths = [
            '/api/health/',
            '/api/status/',
            '/admin/login/',
            '/static/',
            '/media/',
        ]
        
        # 检查公开路径
        for public_path in public_paths:
            if request.path.startswith(public_path):
                return True
        
        # 检查开发环境设置
        if getattr(settings, 'DEBUG', False) and getattr(settings, 'SKIP_AUTH_IN_DEBUG', False):
            auth_logger.warning(f"⚠️ 开发环境跳过认证: {request.path}")
            return True
        
        return False
    
    @log_performance("auth")
    def _authenticate_request(self, request) -> Dict[str, Any]:
        """执行认证检查"""
        request._auth_start_time = time.time()
        
        auth_result = {
            'success': False,
            'error': None,
            'user_info': None,
            'token_info': None
        }
        
        try:
            # 1. 提取认证token
            token_result = self._extract_auth_token(request)
            if not token_result['success']:
                auth_result['error'] = token_result['error']
                return auth_result
            
            token = token_result['token']
            auth_logger.debug(f"🎫 Token提取成功: {request.auth_session_id}")
            
            # 2. 验证token
            validation_result = self._validate_token(token, request)
            if not validation_result['success']:
                auth_result['error'] = validation_result['error']
                return auth_result
            
            auth_logger.debug(f"✅ Token验证成功: {request.auth_session_id}")
            
            # 3. 获取用户信息
            user_result = self._get_user_info(validation_result['payload'], request)
            if not user_result['success']:
                auth_result['error'] = user_result['error']
                return auth_result
            
            # 4. 设置请求用户信息
            request.user = user_result['user']
            
            auth_result.update({
                'success': True,
                'user_info': user_result['user_info'],
                'token_info': validation_result['payload']
            })
            
            return auth_result
            
        except Exception as e:
            auth_logger.error(f"❌ 认证过程异常: {request.auth_session_id} - {str(e)}")
            auth_result['error'] = f"认证系统错误: {str(e)}"
            return auth_result
    
    def _extract_auth_token(self, request) -> Dict[str, Any]:
        """提取认证token"""
        auth_logger.debug(f"🔍 提取认证token: {request.auth_session_id}")
        
        # 从Authorization头提取
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if not auth_header:
            auth_logger.warning(f"⚠️ 缺少Authorization头: {request.auth_session_id}")
            return {
                'success': False,
                'error': '缺少认证信息',
                'token': None
            }
        
        # 检查Bearer格式
        if not auth_header.startswith('Bearer '):
            auth_logger.warning(f"⚠️ 无效的Authorization格式: {request.auth_session_id}")
            return {
                'success': False,
                'error': '无效的认证格式',
                'token': None
            }
        
        token = auth_header[7:]  # 移除 "Bearer " 前缀
        
        if not token:
            auth_logger.warning(f"⚠️ 空token: {request.auth_session_id}")
            return {
                'success': False,
                'error': '空的认证token',
                'token': None
            }
        
        # 脱敏记录token信息
        token_preview = f"{token[:10]}...{token[-10:]}" if len(token) > 20 else "***"
        auth_logger.debug(f"🎫 Token预览: {request.auth_session_id} - {token_preview}")
        
        return {
            'success': True,
            'error': None,
            'token': token
        }
    
    def _validate_token(self, token: str, request) -> Dict[str, Any]:
        """验证JWT token"""
        auth_logger.debug(f"🔐 验证JWT token: {request.auth_session_id}")
        
        try:
            import jwt
            from jwt import PyJWKClient
            
            # 获取JWT配置
            jwt_issuer = getattr(settings, 'AUTH0_DOMAIN', None)
            jwt_audience = getattr(settings, 'AUTH0_AUDIENCE', None)
            jwt_algorithm = getattr(settings, 'JWT_ALGORITHM', 'RS256')
            
            if not jwt_issuer or not jwt_audience:
                auth_logger.error(f"❌ JWT配置缺失: {request.auth_session_id}")
                return {
                    'success': False,
                    'error': 'JWT配置错误',
                    'payload': None
                }
            
            # 记录验证参数
            auth_logger.debug(f"JWT验证参数: issuer={jwt_issuer}, audience={jwt_audience}, algorithm={jwt_algorithm}")
            
            # 获取公钥
            jwks_client = PyJWKClient(f"https://{jwt_issuer}/.well-known/jwks.json")
            signing_key = jwks_client.get_signing_key_from_jwt(token)
            
            # 验证token
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=[jwt_algorithm],
                audience=jwt_audience,
                issuer=f"https://{jwt_issuer}/"
            )
            
            auth_logger.debug(f"✅ JWT验证成功: {request.auth_session_id}")
            auth_logger.debug(f"Token载荷: sub={payload.get('sub')}, exp={payload.get('exp')}")
            
            return {
                'success': True,
                'error': None,
                'payload': payload
            }
            
        except jwt.ExpiredSignatureError:
            auth_logger.warning(f"⚠️ Token已过期: {request.auth_session_id}")
            return {
                'success': False,
                'error': 'Token已过期',
                'payload': None
            }
        except jwt.InvalidTokenError as e:
            auth_logger.warning(f"⚠️ 无效Token: {request.auth_session_id} - {str(e)}")
            return {
                'success': False,
                'error': '无效的认证token',
                'payload': None
            }
        except Exception as e:
            auth_logger.error(f"❌ Token验证异常: {request.auth_session_id} - {str(e)}")
            return {
                'success': False,
                'error': 'Token验证失败',
                'payload': None
            }
    
    def _get_user_info(self, jwt_payload: Dict, request) -> Dict[str, Any]:
        """获取用户信息"""
        auth_logger.debug(f"👤 获取用户信息: {request.auth_session_id}")
        
        try:
            # 从JWT载荷提取用户信息
            auth0_id = jwt_payload.get('sub')
            email = jwt_payload.get('email')
            name = jwt_payload.get('name')
            
            if not auth0_id:
                auth_logger.error(f"❌ JWT载荷缺少用户ID: {request.auth_session_id}")
                return {
                    'success': False,
                    'error': '用户ID缺失',
                    'user': None,
                    'user_info': None
                }
            
            # 记录用户信息（脱敏）
            email_preview = email[:3] + "***" + email[-10:] if email and len(email) > 13 else "***"
            auth_logger.debug(f"用户信息: auth0_id={auth0_id}, email={email_preview}, name={name}")
            
            # 创建或获取用户对象
            user = self._get_or_create_user(auth0_id, email, name, request)
            
            user_info = {
                'auth0_id': auth0_id,
                'email': email,
                'name': name,
                'user_id': user.id if user else None
            }
            
            auth_logger.info(f"✅ 用户信息获取成功: {request.auth_session_id} - {auth0_id}")
            
            return {
                'success': True,
                'error': None,
                'user': user,
                'user_info': user_info
            }
            
        except Exception as e:
            auth_logger.error(f"❌ 获取用户信息异常: {request.auth_session_id} - {str(e)}")
            return {
                'success': False,
                'error': '获取用户信息失败',
                'user': None,
                'user_info': None
            }
    
    def _get_or_create_user(self, auth0_id: str, email: str, name: str, request):
        """获取或创建用户"""
        try:
            from django.contrib.auth import get_user_model
            from chat_with_your_data_api.models import CustomUser
            
            # 尝试获取现有用户
            try:
                user = CustomUser.objects.get(auth0_id=auth0_id)
                auth_logger.debug(f"🔍 找到现有用户: {request.auth_session_id} - {auth0_id}")
                
                # 更新用户信息（如果有变化）
                updated = False
                if user.email != email:
                    user.email = email
                    updated = True
                if user.username != name:
                    user.username = name or email
                    updated = True
                
                if updated:
                    user.save()
                    auth_logger.info(f"📝 用户信息已更新: {request.auth_session_id} - {auth0_id}")
                
                return user
                
            except CustomUser.DoesNotExist:
                # 创建新用户
                auth_logger.info(f"👤 创建新用户: {request.auth_session_id} - {auth0_id}")
                
                user = CustomUser.objects.create(
                    auth0_id=auth0_id,
                    email=email,
                    username=name or email,
                    lang='de'  # 默认语言
                )
                
                auth_logger.info(f"✅ 新用户创建成功: {request.auth_session_id} - {auth0_id} (ID: {user.id})")
                return user
                
        except Exception as e:
            auth_logger.error(f"❌ 用户操作异常: {request.auth_session_id} - {str(e)}")
            return None
    
    def _log_request_headers(self, request):
        """记录请求头信息（敏感信息脱敏）"""
        sensitive_headers = ['authorization', 'cookie', 'x-api-key']
        
        headers = {}
        for key, value in request.META.items():
            if key.startswith('HTTP_'):
                header_name = key[5:].lower().replace('_', '-')
                
                if header_name in sensitive_headers:
                    headers[header_name] = "***REDACTED***"
                else:
                    headers[header_name] = value
        
        auth_logger.debug(f"请求头: {json.dumps(headers, ensure_ascii=False)}")
    
    def _get_client_ip(self, request) -> str:
        """获取客户端IP地址"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    def _create_auth_error_response(self, auth_result: Dict, request) -> JsonResponse:
        """创建认证错误响应"""
        error_message = auth_result.get('error', '认证失败')
        
        auth_logger.warning(f"🚫 认证失败: {request.auth_session_id} - {error_message}")
        
        error_data = {
            'error': 'authentication_failed',
            'message': error_message,
            'session_id': request.auth_session_id,
            'timestamp': datetime.now().isoformat()
        }
        
        return JsonResponse(error_data, status=401)


# 认证装饰器
def require_auth(view_func):
    """认证装饰器 - 要求用户认证"""
    def wrapper(request, *args, **kwargs):
        auth_logger.debug(f"🔐 检查认证装饰器: {request.path}")
        
        if not hasattr(request, 'user') or not request.user:
            auth_logger.warning(f"🚫 装饰器认证失败: {request.path}")
            return JsonResponse({
                'error': 'authentication_required',
                'message': '需要认证',
                'timestamp': datetime.now().isoformat()
            }, status=401)
        
        auth_logger.debug(f"✅ 装饰器认证通过: {request.path}")
        return view_func(request, *args, **kwargs)
    
    return wrapper


# 权限检查装饰器
def require_permission(permission_name: str):
    """权限检查装饰器"""
    def decorator(view_func):
        def wrapper(request, *args, **kwargs):
            auth_logger.debug(f"🔑 检查权限: {request.path} - {permission_name}")
            
            if not hasattr(request, 'user') or not request.user:
                auth_logger.warning(f"🚫 权限检查失败 - 未认证: {request.path}")
                return JsonResponse({
                    'error': 'authentication_required',
                    'message': '需要认证',
                    'timestamp': datetime.now().isoformat()
                }, status=401)
            
            # 这里可以添加具体的权限检查逻辑
            # 目前简化处理，认为所有认证用户都有权限
            
            auth_logger.debug(f"✅ 权限检查通过: {request.path} - {permission_name}")
            return view_func(request, *args, **kwargs)
        
        return wrapper
    return decorator 