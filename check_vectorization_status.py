#!/usr/bin/env python3
"""
向量化状态检查脚本
================

这个脚本可以帮助验证文档是否已正确向量化。
使用方法：
1. 在Django项目目录中运行
2. 设置DJANGO_SETTINGS_MODULE环境变量
3. 运行: python check_vectorization_status.py
"""

import os
import sys
import django
from pathlib import Path

# 添加Django项目路径
sys.path.append('backend/chat_with_your_data')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chat_with_your_data.settings')

try:
    django.setup()
    from chat_with_your_data_api.models import Document, Section, User
    from chat_with_your_data_api.qdrant import search
    from chat_with_your_data_api.embedding import vectorize
    DJANGO_AVAILABLE = True
except Exception as e:
    print(f"❌ Django setup failed: {e}")
    DJANGO_AVAILABLE = False

def check_document_vectorization_status():
    """检查所有文档的向量化状态"""
    if not DJANGO_AVAILABLE:
        print("❌ 无法连接到Django，请检查配置")
        return
    
    print("🔍 检查文档向量化状态...")
    print("=" * 60)
    
    try:
        documents = Document.objects.all()
        total_docs = documents.count()
        
        if total_docs == 0:
            print("📝 没有找到任何文档")
            return
        
        print(f"📊 总文档数: {total_docs}")
        print("-" * 60)
        
        healthy_count = 0
        problematic_docs = []
        
        for doc in documents:
            print(f"\n📄 文档: {doc.filename} (ID: {doc.id})")
            print(f"   用户: {doc.user.username if doc.user else 'N/A'}")
            print(f"   语言: {doc.lang}")
            print(f"   大小: {doc.fileSize} bytes")
            print(f"   上传时间: {doc.uploadedAt}")
            
            # 检查Section表中的记录
            sections = Section.objects.filter(document=doc)
            section_count = sections.count()
            
            print(f"   📊 数据库段落数: {section_count}")
            
            if section_count == 0:
                print("   ❌ 状态: 未向量化 - 没有Section记录")
                problematic_docs.append({
                    'doc': doc,
                    'issue': 'no_sections',
                    'section_count': 0
                })
                continue
            
            # 尝试验证搜索功能
            try:
                if doc.user and doc.user.auth0_id:
                    [_, user_id] = doc.user.auth0_id.split("|")
                    
                    # 使用文档的第一句话进行搜索测试
                    sentences = doc.text.split('.')
                    if sentences and len(sentences[0].strip()) > 10:
                        test_sentence = sentences[0].strip()
                        print(f"   🔍 测试搜索: '{test_sentence[:50]}...'")
                        
                        # 向量化测试句子
                        vector = vectorize(test_sentence)
                        
                        # 在Qdrant中搜索
                        search_results = search(user_id, vector, [doc.id])
                        
                        if len(search_results) > 0:
                            best_score = max(result.score for result in search_results)
                            print(f"   ✅ 搜索成功: {len(search_results)} 个结果，最佳匹配度: {best_score:.3f}")
                            
                            if best_score > 0.8:  # 高相似度阈值
                                print("   ✅ 状态: 健康 - 向量化正常")
                                healthy_count += 1
                            else:
                                print("   ⚠️  状态: 可疑 - 相似度较低")
                                problematic_docs.append({
                                    'doc': doc,
                                    'issue': 'low_similarity',
                                    'section_count': section_count,
                                    'best_score': best_score
                                })
                        else:
                            print("   ❌ 状态: 向量化失败 - 搜索无结果")
                            problematic_docs.append({
                                'doc': doc,
                                'issue': 'no_search_results',
                                'section_count': section_count
                            })
                    else:
                        print("   ⚠️  无法提取测试句子")
                        problematic_docs.append({
                            'doc': doc,
                            'issue': 'no_test_sentence',
                            'section_count': section_count
                        })
                else:
                    print("   ❌ 用户信息缺失")
                    problematic_docs.append({
                        'doc': doc,
                        'issue': 'missing_user',
                        'section_count': section_count
                    })
                    
            except Exception as e:
                print(f"   ❌ 搜索测试失败: {str(e)}")
                problematic_docs.append({
                    'doc': doc,
                    'issue': 'search_error',
                    'section_count': section_count,
                    'error': str(e)
                })
        
        # 总结报告
        print("\n" + "=" * 60)
        print("📊 **向量化状态总结报告**")
        print("=" * 60)
        
        print(f"✅ 健康文档: {healthy_count}/{total_docs}")
        print(f"❌ 问题文档: {len(problematic_docs)}/{total_docs}")
        
        if problematic_docs:
            print("\n🚨 **问题文档详情**:")
            issue_summary = {}
            
            for item in problematic_docs:
                issue = item['issue']
                issue_summary[issue] = issue_summary.get(issue, 0) + 1
                
                print(f"\n📄 {item['doc'].filename} (ID: {item['doc'].id})")
                if issue == 'no_sections':
                    print("   问题: 没有创建Section记录，向量化未开始")
                elif issue == 'no_search_results':
                    print("   问题: 有Section记录但搜索无结果，Qdrant存储可能失败")
                elif issue == 'low_similarity':
                    print(f"   问题: 相似度过低 ({item.get('best_score', 0):.3f})，向量质量可疑")
                elif issue == 'search_error':
                    print(f"   问题: 搜索测试失败 - {item.get('error', 'Unknown')}")
                elif issue == 'missing_user':
                    print("   问题: 用户信息缺失，无法确定Qdrant集合")
                elif issue == 'no_test_sentence':
                    print("   问题: 文档内容无法提取测试句子")
            
            print(f"\n📈 **问题类型统计**:")
            for issue, count in issue_summary.items():
                print(f"   {issue}: {count} 个文档")
        
        # 建议
        print(f"\n💡 **建议**:")
        if healthy_count == total_docs:
            print("   🎉 所有文档向量化状态良好！")
        else:
            print("   🔧 需要修复向量化问题的文档")
            print("   📝 建议添加向量化重试机制")
            print("   🔍 建议实施实时向量化状态监控")
            
    except Exception as e:
        print(f"❌ 检查过程中出现错误: {e}")
        import traceback
        traceback.print_exc()

def check_qdrant_collections():
    """检查Qdrant集合状态"""
    print("\n🔍 检查Qdrant集合状态...")
    print("=" * 60)
    
    try:
        from chat_with_your_data_api.qdrant import __client
        
        # 尝试获取集合信息
        # 注意：这需要Qdrant客户端版本支持
        collections = __client.get_collections()
        
        if hasattr(collections, 'collections'):
            collection_names = [col.name for col in collections.collections]
            print(f"📊 找到 {len(collection_names)} 个集合:")
            
            for name in collection_names:
                try:
                    collection_info = __client.get_collection(name)
                    vector_count = collection_info.vectors_count if hasattr(collection_info, 'vectors_count') else 'Unknown'
                    print(f"   📁 {name}: {vector_count} 个向量")
                except Exception as e:
                    print(f"   ❌ {name}: 获取信息失败 - {e}")
        else:
            print("⚠️  无法获取集合列表")
            
    except Exception as e:
        print(f"❌ 无法连接到Qdrant: {e}")
        print("   请检查QDRANT_URL和QDRANT_SECRET环境变量")

if __name__ == "__main__":
    print("🚀 ChatGPTFirewall 向量化状态检查工具")
    print("=" * 60)
    
    check_document_vectorization_status()
    check_qdrant_collections()
    
    print("\n✨ 检查完成!")
    print("\n💡 如需修复问题，请参考 vectorization_analysis.py 中的建议") 