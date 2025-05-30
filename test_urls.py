"""
测试端点URL配置
===============

将测试API端点集成到Django URL路由中
"""

from django.urls import path, include
from system_test_api import (
    SystemTestApiView,
    health_check_test,
    auth_test,
    file_test,
    vector_test,
    database_test,
    comprehensive_test
)

# 测试端点路由
test_urlpatterns = [
    # 主测试端点 - 显示所有可用测试
    path('api/test/', SystemTestApiView.as_view(), name='system_test_info'),
    
    # 具体功能测试端点
    path('api/test/health/', health_check_test, name='health_check_test'),
    path('api/test/auth/', auth_test, name='auth_test'),
    path('api/test/file/', file_test, name='file_processing_test'),
    path('api/test/vector/', vector_test, name='vector_storage_test'),
    path('api/test/database/', database_test, name='database_test'),
    path('api/test/comprehensive/', comprehensive_test, name='comprehensive_test'),
]

# 如果需要集成到主URL配置中，使用以下代码：
"""
# 在你的主urls.py文件中添加:

from django.urls import path, include
from test_urls import test_urlpatterns

urlpatterns = [
    # ... 你的其他URL配置
    
    # 测试端点
    path('', include(test_urlpatterns)),
    
    # ... 其他配置
]
""" 