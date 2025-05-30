"""
详细日志配置
=============

为ChatGPTFirewall系统提供完整的日志记录功能
包括文件上传、认证、向量化处理等关键流程的日志跟踪
"""

import logging
import logging.config
import os
from datetime import datetime
from pathlib import Path

# 创建日志目录
LOG_DIR = Path("logs")
LOG_DIR.mkdir(exist_ok=True)

# 日志配置
LOGGING_CONFIG = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '[{asctime}] {levelname:8s} [{name}:{lineno}] {funcName}() - {message}',
            'style': '{',
            'datefmt': '%Y-%m-%d %H:%M:%S'
        },
        'simple': {
            'format': '[{asctime}] {levelname:8s} {message}',
            'style': '{',
            'datefmt': '%H:%M:%S'
        },
        'json': {
            '()': 'pythonjsonlogger.jsonlogger.JsonFormatter',
            'format': '%(asctime)s %(name)s %(levelname)s %(funcName)s %(lineno)d %(message)s'
        }
    },
    'handlers': {
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
            'stream': 'ext://sys.stdout'
        },
        'file_debug': {
            'level': 'DEBUG',
            'class': 'logging.handlers.RotatingFileHandler',
            'formatter': 'verbose',
            'filename': str(LOG_DIR / 'debug.log'),
            'maxBytes': 10485760,  # 10MB
            'backupCount': 5,
            'encoding': 'utf-8'
        },
        'file_upload': {
            'level': 'DEBUG',
            'class': 'logging.handlers.RotatingFileHandler',
            'formatter': 'verbose',
            'filename': str(LOG_DIR / 'upload.log'),
            'maxBytes': 10485760,
            'backupCount': 5,
            'encoding': 'utf-8'
        },
        'file_auth': {
            'level': 'DEBUG',
            'class': 'logging.handlers.RotatingFileHandler',
            'formatter': 'verbose',
            'filename': str(LOG_DIR / 'auth.log'),
            'maxBytes': 5242880,  # 5MB
            'backupCount': 3,
            'encoding': 'utf-8'
        },
        'file_vectorization': {
            'level': 'DEBUG',
            'class': 'logging.handlers.RotatingFileHandler',
            'formatter': 'verbose',
            'filename': str(LOG_DIR / 'vectorization.log'),
            'maxBytes': 10485760,
            'backupCount': 5,
            'encoding': 'utf-8'
        },
        'file_error': {
            'level': 'ERROR',
            'class': 'logging.handlers.RotatingFileHandler',
            'formatter': 'verbose',
            'filename': str(LOG_DIR / 'error.log'),
            'maxBytes': 10485760,
            'backupCount': 10,
            'encoding': 'utf-8'
        }
    },
    'loggers': {
        'upload': {
            'handlers': ['console', 'file_upload', 'file_error'],
            'level': 'DEBUG',
            'propagate': False
        },
        'auth': {
            'handlers': ['console', 'file_auth', 'file_error'],
            'level': 'DEBUG',
            'propagate': False
        },
        'vectorization': {
            'handlers': ['console', 'file_vectorization', 'file_error'],
            'level': 'DEBUG',
            'propagate': False
        },
        'qdrant': {
            'handlers': ['console', 'file_vectorization', 'file_error'],
            'level': 'DEBUG',
            'propagate': False
        },
        'file_processor': {
            'handlers': ['console', 'file_upload', 'file_error'],
            'level': 'DEBUG',
            'propagate': False
        }
    },
    'root': {
        'level': 'INFO',
        'handlers': ['console', 'file_debug', 'file_error']
    }
}

def setup_logging():
    """设置日志配置"""
    logging.config.dictConfig(LOGGING_CONFIG)
    
    # 创建专用的日志记录器
    upload_logger = logging.getLogger('upload')
    auth_logger = logging.getLogger('auth')
    vectorization_logger = logging.getLogger('vectorization')
    
    upload_logger.info("📝 上传日志系统已初始化")
    auth_logger.info("🔐 认证日志系统已初始化")
    vectorization_logger.info("🧠 向量化日志系统已初始化")
    
    return {
        'upload': upload_logger,
        'auth': auth_logger,
        'vectorization': vectorization_logger,
        'qdrant': logging.getLogger('qdrant'),
        'file_processor': logging.getLogger('file_processor')
    }

# 性能监控装饰器
def log_performance(logger_name='root', log_args=False):
    """记录函数执行时间的装饰器"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            logger = logging.getLogger(logger_name)
            start_time = datetime.now()
            
            if log_args:
                logger.debug(f"🚀 开始执行 {func.__name__}() - 参数: args={args[:2] if args else None}, kwargs={list(kwargs.keys())}")
            else:
                logger.debug(f"🚀 开始执行 {func.__name__}()")
            
            try:
                result = func(*args, **kwargs)
                duration = (datetime.now() - start_time).total_seconds()
                logger.info(f"✅ {func.__name__}() 执行成功 - 耗时: {duration:.3f}秒")
                return result
            except Exception as e:
                duration = (datetime.now() - start_time).total_seconds()
                logger.error(f"❌ {func.__name__}() 执行失败 - 耗时: {duration:.3f}秒 - 错误: {str(e)}")
                raise
        return wrapper
    return decorator

# 错误跟踪装饰器
def log_errors(logger_name='root', reraise=True):
    """记录错误详情的装饰器"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            logger = logging.getLogger(logger_name)
            try:
                return func(*args, **kwargs)
            except Exception as e:
                import traceback
                logger.error(f"❌ {func.__name__}() 发生异常:")
                logger.error(f"   异常类型: {type(e).__name__}")
                logger.error(f"   异常信息: {str(e)}")
                logger.error(f"   异常堆栈:\n{traceback.format_exc()}")
                
                if reraise:
                    raise
                return None
        return wrapper
    return decorator

# 用户操作跟踪
def log_user_action(action_type, logger_name='upload'):
    """记录用户操作的装饰器"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            logger = logging.getLogger(logger_name)
            
            # 尝试从request中获取用户信息
            request = None
            if args and hasattr(args[0], 'request'):
                request = args[0].request
            elif args and hasattr(args[0], 'user'):
                user = args[0].user
            
            user_info = "未知用户"
            if request and hasattr(request, 'user') and request.user:
                if hasattr(request.user, 'username'):
                    user_info = f"用户:{request.user.username}"
                elif hasattr(request.user, 'auth0_id'):
                    user_info = f"Auth0ID:{request.user.auth0_id}"
            
            logger.info(f"👤 {action_type} - {user_info}")
            
            return func(*args, **kwargs)
        return wrapper
    return decorator

# 数据验证日志
def log_data_validation(logger_name='upload'):
    """记录数据验证过程"""
    def decorator(func):
        def wrapper(data, *args, **kwargs):
            logger = logging.getLogger(logger_name)
            
            logger.debug(f"🔍 验证数据: {func.__name__}")
            logger.debug(f"   数据类型: {type(data).__name__}")
            
            if hasattr(data, 'keys'):
                logger.debug(f"   数据字段: {list(data.keys())}")
            
            try:
                result = func(data, *args, **kwargs)
                if hasattr(result, 'is_valid'):
                    if result.is_valid():
                        logger.debug(f"✅ 数据验证通过: {func.__name__}")
                    else:
                        logger.warning(f"⚠️ 数据验证失败: {func.__name__} - 错误: {result.errors}")
                return result
            except Exception as e:
                logger.error(f"❌ 数据验证异常: {func.__name__} - {str(e)}")
                raise
        return wrapper
    return decorator

if __name__ == "__main__":
    # 测试日志配置
    loggers = setup_logging()
    
    loggers['upload'].info("🧪 测试上传日志")
    loggers['auth'].info("🧪 测试认证日志")
    loggers['vectorization'].info("🧪 测试向量化日志")
    
    print("✅ 日志配置测试完成，请检查 logs/ 目录") 