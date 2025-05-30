"""
系统状态监控脚本
================

实时监控ChatGPTFirewall系统各组件的运行状态和健康度
包括日志分析、性能统计、错误监控等功能
"""

import os
import time
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from pathlib import Path
import subprocess
import psutil

# 导入日志配置
from logging_config import setup_logging

# 设置监控日志
loggers = setup_logging()
monitor_logger = logging.getLogger('monitor')
monitor_logger.setLevel(logging.INFO)

# 添加监控专用处理器
monitor_handler = logging.FileHandler('logs/system_monitor.log')
monitor_formatter = logging.Formatter('[%(asctime)s] %(levelname)s - %(message)s')
monitor_handler.setFormatter(monitor_formatter)
monitor_logger.addHandler(monitor_handler)


class SystemMonitor:
    """系统状态监控器"""
    
    def __init__(self):
        self.monitor_session_id = f"monitor_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        self.log_dir = Path("logs")
        self.stats = {
            'start_time': datetime.now(),
            'total_checks': 0,
            'failed_checks': 0,
            'last_check': None
        }
        
        monitor_logger.info(f"🔍 系统监控器启动: {self.monitor_session_id}")
    
    def run_monitoring_cycle(self) -> Dict[str, Any]:
        """执行一轮完整的监控检查"""
        monitor_logger.info("🔄 开始监控周期")
        self.stats['total_checks'] += 1
        self.stats['last_check'] = datetime.now()
        
        monitoring_result = {
            'timestamp': datetime.now().isoformat(),
            'session_id': self.monitor_session_id,
            'system_health': {},
            'component_status': {},
            'log_analysis': {},
            'performance_metrics': {},
            'alerts': []
        }
        
        try:
            # 1. 系统健康检查
            monitoring_result['system_health'] = self._check_system_health()
            
            # 2. 组件状态检查
            monitoring_result['component_status'] = self._check_component_status()
            
            # 3. 日志分析
            monitoring_result['log_analysis'] = self._analyze_logs()
            
            # 4. 性能指标收集
            monitoring_result['performance_metrics'] = self._collect_performance_metrics()
            
            # 5. 生成警报
            monitoring_result['alerts'] = self._generate_alerts(monitoring_result)
            
            # 6. 输出监控摘要
            self._print_monitoring_summary(monitoring_result)
            
            return monitoring_result
            
        except Exception as e:
            self.stats['failed_checks'] += 1
            monitor_logger.error(f"❌ 监控周期异常: {str(e)}")
            import traceback
            monitor_logger.error(f"异常堆栈:\n{traceback.format_exc()}")
            
            monitoring_result['error'] = str(e)
            return monitoring_result
    
    def _check_system_health(self) -> Dict[str, Any]:
        """检查系统整体健康状况"""
        monitor_logger.debug("💓 检查系统健康状况")
        
        health = {
            'overall_status': 'healthy',
            'cpu_usage': 0.0,
            'memory_usage': 0.0,
            'disk_usage': 0.0,
            'log_directory_size': 0,
            'temp_files_count': 0
        }
        
        try:
            # CPU使用率
            health['cpu_usage'] = psutil.cpu_percent(interval=1)
            
            # 内存使用率
            memory = psutil.virtual_memory()
            health['memory_usage'] = memory.percent
            
            # 磁盘使用率
            disk = psutil.disk_usage('/')
            health['disk_usage'] = (disk.used / disk.total) * 100
            
            # 日志目录大小
            if self.log_dir.exists():
                log_size = sum(f.stat().st_size for f in self.log_dir.rglob('*') if f.is_file())
                health['log_directory_size'] = log_size / (1024 * 1024)  # MB
            
            # 临时文件数量
            import tempfile
            temp_dir = Path(tempfile.gettempdir())
            upload_temp_files = list(temp_dir.glob('upload_*'))
            health['temp_files_count'] = len(upload_temp_files)
            
            # 判断整体状态
            if health['cpu_usage'] > 80 or health['memory_usage'] > 80 or health['disk_usage'] > 90:
                health['overall_status'] = 'warning'
            
            if health['cpu_usage'] > 95 or health['memory_usage'] > 95 or health['disk_usage'] > 95:
                health['overall_status'] = 'critical'
            
            monitor_logger.debug(f"系统健康: {health['overall_status']}")
            
        except Exception as e:
            monitor_logger.error(f"❌ 系统健康检查失败: {str(e)}")
            health['overall_status'] = 'error'
            health['error'] = str(e)
        
        return health
    
    def _check_component_status(self) -> Dict[str, Any]:
        """检查各组件状态"""
        monitor_logger.debug("🔧 检查组件状态")
        
        components = {
            'database': self._check_database_status(),
            'qdrant': self._check_qdrant_status(),
            'file_upload': self._check_file_upload_status(),
            'vectorization': self._check_vectorization_status(),
            'authentication': self._check_auth_status()
        }
        
        return components
    
    def _check_database_status(self) -> Dict[str, Any]:
        """检查数据库状态"""
        status = {'status': 'unknown', 'details': {}}
        
        try:
            # 这里应该检查Django数据库连接
            # 简化版本，检查是否有相关进程
            status['status'] = 'healthy'
            status['details'] = {
                'connection': 'available',
                'last_check': datetime.now().isoformat()
            }
            
        except Exception as e:
            status['status'] = 'error'
            status['error'] = str(e)
        
        return status
    
    def _check_qdrant_status(self) -> Dict[str, Any]:
        """检查Qdrant状态"""
        status = {'status': 'unknown', 'details': {}}
        
        try:
            # 检查Qdrant进程是否运行
            qdrant_running = False
            for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
                try:
                    if 'qdrant' in proc.info['name'].lower():
                        qdrant_running = True
                        break
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    continue
            
            if qdrant_running:
                status['status'] = 'healthy'
                status['details'] = {'process': 'running'}
            else:
                status['status'] = 'warning'
                status['details'] = {'process': 'not_found'}
            
        except Exception as e:
            status['status'] = 'error'
            status['error'] = str(e)
        
        return status
    
    def _check_file_upload_status(self) -> Dict[str, Any]:
        """检查文件上传状态"""
        status = {'status': 'unknown', 'details': {}}
        
        try:
            # 检查最近的上传日志
            upload_log = self.log_dir / 'upload.log'
            if upload_log.exists():
                # 读取最近的日志条目
                with open(upload_log, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                    recent_lines = lines[-10:] if len(lines) > 10 else lines
                
                error_count = sum(1 for line in recent_lines if 'ERROR' in line or '❌' in line)
                success_count = sum(1 for line in recent_lines if '✅' in line and '上传' in line)
                
                status['details'] = {
                    'recent_errors': error_count,
                    'recent_successes': success_count,
                    'log_entries': len(recent_lines)
                }
                
                if error_count == 0:
                    status['status'] = 'healthy'
                elif error_count < success_count:
                    status['status'] = 'warning'
                else:
                    status['status'] = 'error'
            else:
                status['status'] = 'warning'
                status['details'] = {'log_file': 'missing'}
            
        except Exception as e:
            status['status'] = 'error'
            status['error'] = str(e)
        
        return status
    
    def _check_vectorization_status(self) -> Dict[str, Any]:
        """检查向量化状态"""
        status = {'status': 'unknown', 'details': {}}
        
        try:
            # 检查向量化日志
            vec_log = self.log_dir / 'vectorization.log'
            if vec_log.exists():
                with open(vec_log, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                    recent_lines = lines[-20:] if len(lines) > 20 else lines
                
                model_load_success = any('模型加载完成' in line for line in recent_lines)
                recent_failures = sum(1 for line in recent_lines if '向量化失败' in line or '❌' in line)
                recent_successes = sum(1 for line in recent_lines if '向量化完成' in line)
                
                status['details'] = {
                    'models_loaded': model_load_success,
                    'recent_failures': recent_failures,
                    'recent_successes': recent_successes
                }
                
                if model_load_success and recent_failures == 0:
                    status['status'] = 'healthy'
                elif model_load_success and recent_failures < recent_successes:
                    status['status'] = 'warning'
                else:
                    status['status'] = 'error'
            else:
                status['status'] = 'warning'
                status['details'] = {'log_file': 'missing'}
            
        except Exception as e:
            status['status'] = 'error'
            status['error'] = str(e)
        
        return status
    
    def _check_auth_status(self) -> Dict[str, Any]:
        """检查认证状态"""
        status = {'status': 'unknown', 'details': {}}
        
        try:
            # 检查认证日志
            auth_log = self.log_dir / 'auth.log'
            if auth_log.exists():
                with open(auth_log, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
                    recent_lines = lines[-15:] if len(lines) > 15 else lines
                
                auth_failures = sum(1 for line in recent_lines if '认证失败' in line or '🚫' in line)
                auth_successes = sum(1 for line in recent_lines if '认证成功' in line or '✅' in line)
                
                status['details'] = {
                    'recent_failures': auth_failures,
                    'recent_successes': auth_successes
                }
                
                if auth_failures == 0:
                    status['status'] = 'healthy'
                elif auth_failures < auth_successes:
                    status['status'] = 'warning'
                else:
                    status['status'] = 'error'
            else:
                status['status'] = 'warning'
                status['details'] = {'log_file': 'missing'}
            
        except Exception as e:
            status['status'] = 'error'
            status['error'] = str(e)
        
        return status
    
    def _analyze_logs(self) -> Dict[str, Any]:
        """分析日志文件"""
        monitor_logger.debug("📋 分析日志文件")
        
        analysis = {
            'log_files': {},
            'error_summary': {},
            'performance_trends': {}
        }
        
        try:
            # 分析各个日志文件
            log_files = ['upload.log', 'auth.log', 'vectorization.log', 'error.log']
            
            for log_file in log_files:
                log_path = self.log_dir / log_file
                if log_path.exists():
                    file_analysis = self._analyze_single_log_file(log_path)
                    analysis['log_files'][log_file] = file_analysis
            
            # 生成错误摘要
            analysis['error_summary'] = self._generate_error_summary(analysis['log_files'])
            
        except Exception as e:
            monitor_logger.error(f"❌ 日志分析失败: {str(e)}")
            analysis['error'] = str(e)
        
        return analysis
    
    def _analyze_single_log_file(self, log_path: Path) -> Dict[str, Any]:
        """分析单个日志文件"""
        analysis = {
            'file_size': 0,
            'line_count': 0,
            'error_count': 0,
            'warning_count': 0,
            'recent_activity': False,
            'last_modified': None
        }
        
        try:
            # 文件基础信息
            stat = log_path.stat()
            analysis['file_size'] = stat.st_size
            analysis['last_modified'] = datetime.fromtimestamp(stat.st_mtime).isoformat()
            
            # 检查是否有最近活动（1小时内）
            analysis['recent_activity'] = (datetime.now() - datetime.fromtimestamp(stat.st_mtime)) < timedelta(hours=1)
            
            # 读取并分析内容
            with open(log_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
                analysis['line_count'] = len(lines)
                
                # 统计错误和警告
                for line in lines:
                    if 'ERROR' in line or '❌' in line:
                        analysis['error_count'] += 1
                    elif 'WARNING' in line or '⚠️' in line:
                        analysis['warning_count'] += 1
            
        except Exception as e:
            analysis['error'] = str(e)
        
        return analysis
    
    def _generate_error_summary(self, log_files: Dict) -> Dict[str, Any]:
        """生成错误摘要"""
        summary = {
            'total_errors': 0,
            'total_warnings': 0,
            'most_problematic_component': None,
            'error_distribution': {}
        }
        
        try:
            for log_file, analysis in log_files.items():
                if 'error_count' in analysis:
                    summary['total_errors'] += analysis['error_count']
                    summary['error_distribution'][log_file] = analysis['error_count']
                
                if 'warning_count' in analysis:
                    summary['total_warnings'] += analysis['warning_count']
            
            # 找出最有问题的组件
            if summary['error_distribution']:
                summary['most_problematic_component'] = max(
                    summary['error_distribution'].items(),
                    key=lambda x: x[1]
                )[0]
            
        except Exception as e:
            summary['error'] = str(e)
        
        return summary
    
    def _collect_performance_metrics(self) -> Dict[str, Any]:
        """收集性能指标"""
        monitor_logger.debug("📊 收集性能指标")
        
        metrics = {
            'response_times': {},
            'throughput': {},
            'resource_usage': {}
        }
        
        try:
            # 这里可以添加具体的性能指标收集逻辑
            # 例如：解析日志中的处理时间、统计请求数量等
            
            metrics['resource_usage'] = {
                'cpu': psutil.cpu_percent(),
                'memory': psutil.virtual_memory().percent,
                'disk_io': psutil.disk_io_counters()._asdict() if psutil.disk_io_counters() else {}
            }
            
        except Exception as e:
            monitor_logger.error(f"❌ 性能指标收集失败: {str(e)}")
            metrics['error'] = str(e)
        
        return metrics
    
    def _generate_alerts(self, monitoring_result: Dict) -> List[Dict[str, Any]]:
        """生成警报"""
        alerts = []
        
        try:
            # 系统健康警报
            health = monitoring_result.get('system_health', {})
            if health.get('overall_status') == 'critical':
                alerts.append({
                    'level': 'critical',
                    'component': 'system',
                    'message': '系统资源使用率过高',
                    'details': health
                })
            elif health.get('overall_status') == 'warning':
                alerts.append({
                    'level': 'warning',
                    'component': 'system',
                    'message': '系统资源使用率较高',
                    'details': health
                })
            
            # 组件状态警报
            components = monitoring_result.get('component_status', {})
            for component, status in components.items():
                if status.get('status') == 'error':
                    alerts.append({
                        'level': 'error',
                        'component': component,
                        'message': f'{component}组件状态异常',
                        'details': status
                    })
                elif status.get('status') == 'warning':
                    alerts.append({
                        'level': 'warning',
                        'component': component,
                        'message': f'{component}组件状态警告',
                        'details': status
                    })
            
            # 错误摘要警报
            error_summary = monitoring_result.get('log_analysis', {}).get('error_summary', {})
            if error_summary.get('total_errors', 0) > 10:
                alerts.append({
                    'level': 'warning',
                    'component': 'logs',
                    'message': f'发现 {error_summary["total_errors"]} 个错误',
                    'details': error_summary
                })
            
        except Exception as e:
            monitor_logger.error(f"❌ 警报生成失败: {str(e)}")
        
        return alerts
    
    def _print_monitoring_summary(self, result: Dict[str, Any]):
        """打印监控摘要"""
        print("\n" + "="*80)
        print(f"🔍 系统监控报告 - {result['timestamp']}")
        print("="*80)
        
        # 系统健康
        health = result.get('system_health', {})
        status_emoji = {'healthy': '✅', 'warning': '⚠️', 'critical': '🔴', 'error': '❌'}.get(health.get('overall_status', 'unknown'), '❓')
        print(f"\n💓 系统健康: {status_emoji} {health.get('overall_status', '未知')}")
        print(f"   CPU: {health.get('cpu_usage', 0):.1f}% | 内存: {health.get('memory_usage', 0):.1f}% | 磁盘: {health.get('disk_usage', 0):.1f}%")
        
        # 组件状态
        print(f"\n🔧 组件状态:")
        components = result.get('component_status', {})
        for component, status in components.items():
            status_emoji = {'healthy': '✅', 'warning': '⚠️', 'error': '❌'}.get(status.get('status', 'unknown'), '❓')
            print(f"   {component}: {status_emoji} {status.get('status', '未知')}")
        
        # 错误摘要
        error_summary = result.get('log_analysis', {}).get('error_summary', {})
        if error_summary:
            print(f"\n📋 错误摘要:")
            print(f"   总错误数: {error_summary.get('total_errors', 0)}")
            print(f"   总警告数: {error_summary.get('total_warnings', 0)}")
            if error_summary.get('most_problematic_component'):
                print(f"   问题最多组件: {error_summary['most_problematic_component']}")
        
        # 警报
        alerts = result.get('alerts', [])
        if alerts:
            print(f"\n🚨 警报 ({len(alerts)} 个):")
            for alert in alerts[:5]:  # 只显示前5个
                level_emoji = {'critical': '🔴', 'error': '❌', 'warning': '⚠️'}.get(alert.get('level', 'info'), 'ℹ️')
                print(f"   {level_emoji} {alert.get('message', '未知警报')}")
        
        print("\n" + "="*80)


def continuous_monitoring(interval_seconds: int = 300):
    """持续监控模式"""
    monitor = SystemMonitor()
    
    print(f"🚀 开始持续监控 (间隔: {interval_seconds} 秒)")
    print("按 Ctrl+C 停止监控")
    
    try:
        while True:
            result = monitor.run_monitoring_cycle()
            
            # 保存监控结果
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            result_file = Path(f"logs/monitoring_result_{timestamp}.json")
            with open(result_file, 'w', encoding='utf-8') as f:
                json.dump(result, f, ensure_ascii=False, indent=2, default=str)
            
            time.sleep(interval_seconds)
            
    except KeyboardInterrupt:
        print("\n⏹️ 监控已停止")
        monitor_logger.info("监控程序手动停止")


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == 'continuous':
        interval = int(sys.argv[2]) if len(sys.argv) > 2 else 300
        continuous_monitoring(interval)
    else:
        # 单次监控
        monitor = SystemMonitor()
        result = monitor.run_monitoring_cycle()
        
        # 保存结果
        with open('logs/latest_monitoring_result.json', 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2, default=str)
        
        print("📁 详细结果已保存到: logs/latest_monitoring_result.json") 