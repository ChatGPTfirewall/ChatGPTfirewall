#!/usr/bin/env python3
"""
系统测试运行脚本
===============

命令行工具，用于自动运行ChatGPTFirewall系统的各项功能测试
支持单独运行特定测试或运行完整测试套件
"""

import os
import sys
import json
import requests
import argparse
from datetime import datetime
from typing import Dict, Any, List
import time

class SystemTestRunner:
    """系统测试运行器"""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        """
        初始化测试运行器
        
        Args:
            base_url: Django服务器的基础URL
        """
        self.base_url = base_url.rstrip('/')
        self.test_session_id = f"cli_test_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        self.results = {}
        
    def print_header(self, title: str):
        """打印测试标题"""
        print("\n" + "="*80)
        print(f"🧪 {title}")
        print("="*80)
    
    def print_result(self, test_name: str, result: Dict[str, Any]):
        """打印测试结果"""
        status = result.get('status', 'unknown')
        status_emoji = {
            'passed': '✅',
            'failed': '❌', 
            'error': '💥',
            'partial': '⚠️',
            'healthy': '✅',
            'unhealthy': '❌',
            'degraded': '⚠️'
        }.get(status, '❓')
        
        print(f"\n{status_emoji} {test_name.upper()}: {status}")
        
        # 显示步骤信息
        if 'steps' in result:
            print("   步骤:")
            for step in result['steps'][:5]:  # 只显示前5个步骤
                print(f"     {step}")
            if len(result['steps']) > 5:
                print(f"     ... 还有 {len(result['steps']) - 5} 个步骤")
        
        # 显示错误信息
        if result.get('error'):
            print(f"   错误: {result['error']}")
        
        # 显示关键指标
        if 'details' in result:
            details = result['details']
            if test_name == 'database' and 'record_counts' in details:
                counts = details['record_counts']
                print(f"   数据库记录: 用户 {counts.get('users', 0)}, 文档 {counts.get('documents', 0)}, 段落 {counts.get('sections', 0)}")
            
            if test_name == 'vector' and 'vector_dimension' in details:
                print(f"   向量维度: {details['vector_dimension']}")
            
            if test_name == 'health' and 'checks' in details:
                checks = details['checks']
                print(f"   系统检查: Python ✅, Django ✅, 依赖库状态详见详细结果")
    
    def make_request(self, endpoint: str, method: str = 'GET', data: Dict = None) -> Dict[str, Any]:
        """发送HTTP请求"""
        url = f"{self.base_url}{endpoint}"
        
        try:
            if method.upper() == 'GET':
                response = requests.get(url, timeout=30)
            elif method.upper() == 'POST':
                response = requests.post(url, json=data or {}, timeout=30)
            else:
                raise ValueError(f"不支持的HTTP方法: {method}")
            
            if response.status_code == 200:
                return response.json()
            else:
                return {
                    'status': 'error',
                    'error': f"HTTP {response.status_code}: {response.text[:200]}"
                }
                
        except requests.exceptions.RequestException as e:
            return {
                'status': 'error',
                'error': f"请求异常: {str(e)}"
            }
        except Exception as e:
            return {
                'status': 'error',
                'error': f"未知错误: {str(e)}"
            }
    
    def test_health(self) -> Dict[str, Any]:
        """系统健康检查测试"""
        print("🔍 执行系统健康检查...")
        return self.make_request('/api/test/health/')
    
    def test_database(self) -> Dict[str, Any]:
        """数据库连接测试"""
        print("🗄️ 执行数据库连接测试...")
        return self.make_request('/api/test/database/')
    
    def test_file_processing(self) -> Dict[str, Any]:
        """文件处理功能测试"""
        print("📄 执行文件处理功能测试...")
        test_data = {
            'test_content': '这是一个用于测试文件处理功能的示例文档内容。包含中文和德语混合文本内容，用于验证文本提取和处理是否正常工作。Das ist ein Test für die Dokumentenverarbeitung.'
        }
        return self.make_request('/api/test/file/', 'POST', test_data)
    
    def test_vector_storage(self) -> Dict[str, Any]:
        """向量存储功能测试"""
        print("🧠 执行向量存储功能测试...")
        test_data = {
            'text': '这是一个用于测试向量化功能的示例文本。它包含足够的内容来验证文本分段、向量生成和Qdrant存储等功能是否正常工作。'
        }
        return self.make_request('/api/test/vector/', 'POST', test_data)
    
    def test_auth(self, token: str = None) -> Dict[str, Any]:
        """认证功能测试"""
        print("🔐 执行认证功能测试...")
        
        if not token:
            # 使用示例token进行测试（实际应该是有效的JWT）
            token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.example_jwt_token_for_testing"
            print("   ⚠️ 使用示例token，可能会失败（这是正常的）")
        
        test_data = {'token': token}
        return self.make_request('/api/test/auth/', 'POST', test_data)
    
    def test_comprehensive(self) -> Dict[str, Any]:
        """综合测试"""
        print("🚀 执行综合系统测试...")
        test_data = {'run_all_tests': True}
        return self.make_request('/api/test/comprehensive/', 'POST', test_data)
    
    def run_single_test(self, test_name: str, **kwargs) -> Dict[str, Any]:
        """运行单个测试"""
        test_methods = {
            'health': self.test_health,
            'database': self.test_database,
            'file': self.test_file_processing,
            'vector': self.test_vector_storage,
            'auth': self.test_auth,
            'comprehensive': self.test_comprehensive
        }
        
        if test_name not in test_methods:
            return {
                'status': 'error',
                'error': f"未知的测试类型: {test_name}"
            }
        
        self.print_header(f"{test_name.upper()} 测试")
        
        start_time = time.time()
        result = test_methods[test_name](**kwargs)
        duration = time.time() - start_time
        
        result['test_duration'] = duration
        self.results[test_name] = result
        
        self.print_result(test_name, result)
        print(f"   耗时: {duration:.2f} 秒")
        
        return result
    
    def run_all_tests(self, include_auth: bool = False, auth_token: str = None) -> Dict[str, Any]:
        """运行所有测试"""
        self.print_header("ChatGPTFirewall 系统测试套件")
        print(f"测试会话ID: {self.test_session_id}")
        print(f"目标服务器: {self.base_url}")
        
        # 定义测试顺序
        tests_to_run = [
            ('health', {}),
            ('database', {}),
            ('file', {}),
            ('vector', {})
        ]
        
        # 如果指定了认证测试
        if include_auth:
            tests_to_run.append(('auth', {'token': auth_token}))
        
        # 运行各个测试
        for test_name, kwargs in tests_to_run:
            try:
                self.run_single_test(test_name, **kwargs)
                time.sleep(1)  # 测试间隔
            except Exception as e:
                print(f"❌ 测试 {test_name} 发生异常: {str(e)}")
                self.results[test_name] = {
                    'status': 'error',
                    'error': str(e)
                }
        
        # 生成测试摘要
        self.print_test_summary()
        
        return self.results
    
    def print_test_summary(self):
        """打印测试摘要"""
        self.print_header("测试摘要")
        
        total_tests = len(self.results)
        passed_tests = sum(1 for r in self.results.values() 
                          if r.get('status') in ['passed', 'healthy'])
        failed_tests = sum(1 for r in self.results.values() 
                          if r.get('status') in ['failed', 'unhealthy'])
        error_tests = sum(1 for r in self.results.values() 
                         if r.get('status') == 'error')
        
        print(f"总测试数: {total_tests}")
        print(f"✅ 通过: {passed_tests}")
        print(f"❌ 失败: {failed_tests}")
        print(f"💥 错误: {error_tests}")
        
        if total_tests > 0:
            success_rate = (passed_tests / total_tests) * 100
            print(f"成功率: {success_rate:.1f}%")
            
            if success_rate >= 80:
                print("🎉 系统状态良好")
            elif success_rate >= 60:
                print("⚠️ 系统有部分问题，需要关注")
            else:
                print("🚨 系统存在严重问题，需要立即处理")
    
    def save_results(self, filename: str = None):
        """保存测试结果到文件"""
        if not filename:
            filename = f"test_results_{self.test_session_id}.json"
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump({
                'session_id': self.test_session_id,
                'timestamp': datetime.now().isoformat(),
                'base_url': self.base_url,
                'results': self.results
            }, f, ensure_ascii=False, indent=2, default=str)
        
        print(f"📄 测试结果已保存到: {filename}")


def main():
    """主函数"""
    parser = argparse.ArgumentParser(description='ChatGPTFirewall系统测试工具')
    parser.add_argument('--url', default='http://localhost:8000', 
                       help='Django服务器URL (默认: http://localhost:8000)')
    parser.add_argument('--test', choices=['health', 'database', 'file', 'vector', 'auth', 'comprehensive', 'all'],
                       default='all', help='要运行的测试类型')
    parser.add_argument('--auth-token', help='用于认证测试的JWT token')
    parser.add_argument('--save', help='保存结果的文件名')
    parser.add_argument('--verbose', action='store_true', help='显示详细输出')
    
    args = parser.parse_args()
    
    # 创建测试运行器
    runner = SystemTestRunner(args.url)
    
    try:
        if args.test == 'all':
            # 运行所有测试
            include_auth = args.auth_token is not None
            runner.run_all_tests(include_auth=include_auth, auth_token=args.auth_token)
        else:
            # 运行单个测试
            kwargs = {}
            if args.test == 'auth' and args.auth_token:
                kwargs['token'] = args.auth_token
            
            runner.run_single_test(args.test, **kwargs)
        
        # 保存结果
        if args.save:
            runner.save_results(args.save)
        
        # 返回适当的退出代码
        failed_tests = sum(1 for r in runner.results.values() 
                          if r.get('status') in ['failed', 'error', 'unhealthy'])
        
        if failed_tests > 0:
            print(f"\n⚠️ 有 {failed_tests} 个测试失败，请检查详细输出")
            sys.exit(1)
        else:
            print(f"\n🎉 所有测试都已通过！")
            sys.exit(0)
            
    except KeyboardInterrupt:
        print("\n⏹️ 测试被用户中断")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 测试运行器发生异常: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main() 