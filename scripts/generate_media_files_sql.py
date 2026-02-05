#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
根据 res/file_path.py 生成 media_files 表的初始化 SQL 脚本
"""

import re
import os

# 读取 file_path.py 文件
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)
file_path_py = os.path.join(project_root, 'res', 'file_path.py')

with open(file_path_py, 'r', encoding='utf-8') as f:
    content = f.read()

# 提取中文映射（chinese_to_path_mapping 字典）
mapping_match = re.search(r'chinese_to_path_mapping = \{(.*?)\}', content, re.DOTALL)
chinese_mapping = {}
if mapping_match:
    mapping_str = mapping_match.group(1)
    # 提取中文名称到路径的映射（结果为：path -> 中文名）
    for match in re.finditer(r'["\']([^"\']+)["\']:\s*["\']([^"\']+)["\']', mapping_str):
        chinese_mapping[match.group(2)] = match.group(1)

# 提取 file_paths 列表（如果存在），否则退化为使用 chinese_to_path_mapping 中的所有路径
file_paths_match = re.search(r'file_paths = \[(.*?)\]', content, re.DOTALL)
paths = []
if file_paths_match:
    file_paths_str = file_paths_match.group(1)
    # 提取所有路径（包括注释行，后面过滤）
    all_lines = file_paths_str.split('\n')
    for line in all_lines:
        # 提取引号中的路径
        matches = re.findall(r'["\']([^"\']+)["\']', line)
        if matches and not line.strip().startswith('#'):
            paths.extend(matches)
else:
    if chinese_mapping:
        # 如果没有显式的 file_paths，就直接使用映射中的所有路径
        paths = list(chinese_mapping.keys())
    else:
        print('Error: Could not find file_paths or chinese_to_path_mapping')
        exit(1)

# 文件类型映射
def get_file_type(path):
    ext = path.lower().split('.')[-1] if '.' in path else ''
    if ext in ['pdf']:
        return 'PDF'
    elif ext in ['pptx', 'ppt']:
        return 'PPT'
    elif ext in ['xlsx', 'xls']:
        return 'Excel'
    elif ext in ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg']:
        return 'Image'
    elif ext in ['mp4', 'mov', 'avi', 'mkv', 'flv', 'wmv', 'webm', 'ts', 'mp4', 'mp4']:
        return 'Video'
    elif ext in ['srt', 'wav']:
        # 字幕文件和音频文件，暂时归类为 Article 或 Video
        return 'Article'  # 或者可以扩展为 Audio 类型
    else:
        return 'Article'

# 判断是否可预览
def is_viewable(path):
    ext = path.lower().split('.')[-1] if '.' in path else ''
    viewable_exts = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 
                     'mp4', 'mov', 'avi', 'mkv', 'flv', 'wmv', 'webm', 'ts',
                     'mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a']
    return ext in viewable_exts

# 判断分类
def get_category(path):
    if path.startswith('/00-Sales Kit/'):
        return 'sales'
    elif path.startswith('/01-Presale-Company/'):
        return 'company'
    elif path.startswith('/02-Presale-Product/'):
        return 'product'
    elif path.startswith('/04-Technical Support/'):
        return 'maintenance'
    else:
        return 'product'  # 默认

# 生成 fileId（简单递增）
file_id_counter = 1

# 生成 SQL
sql_lines = []
sql_lines.append('-- =====================================================')
sql_lines.append('-- 媒体文件表初始化数据脚本')
sql_lines.append('-- 根据 res/file_path.py 自动生成')
sql_lines.append('-- 执行日期：2024-01-23')
sql_lines.append('-- =====================================================')
sql_lines.append('')
sql_lines.append('USE cleaner_support;')
sql_lines.append('')
sql_lines.append('-- 清空现有数据（可选，首次初始化时使用）')
sql_lines.append('-- TRUNCATE TABLE media_files;')
sql_lines.append('')
sql_lines.append('-- =====================================================')
sql_lines.append('-- 插入媒体文件数据')
sql_lines.append('-- =====================================================')
sql_lines.append('')

for path in paths:
    if not path or path.strip() == '':
        continue
    
    # 获取标题（优先使用中文映射）
    title = chinese_mapping.get(path, path.split('/')[-1])
    # 如果没有中文映射，尝试从文件名提取（去掉扩展名）
    if title == path.split('/')[-1]:
        # 去掉扩展名，保留文件名
        filename = title.rsplit('.', 1)[0] if '.' in title else title
        title = filename
    # 清理标题中的特殊字符（SQL 转义）
    title = title.replace("'", "''")  # SQL 转义单引号
    title = title.replace("\\", "\\\\")  # SQL 转义反斜杠
    
    file_type = get_file_type(path)
    category = get_category(path)
    viewable = is_viewable(path)
    file_id = f'KB{file_id_counter:06d}'
    
    # SQL 转义路径中的单引号
    safe_path = path.replace("'", "''")
    
    # 使用批量插入优化（每批 50 条）
    if file_id_counter == 1 or (file_id_counter - 1) % 50 == 0:
        if file_id_counter > 1:
            sql_lines.append(';')
            sql_lines.append('')
        sql_lines.append(f"INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES")
    else:
        sql_lines[-1] = sql_lines[-1].rstrip(';') + ','
    
    sql_lines.append(f"('{file_id}', '{title}', '{file_type}', '{category}', '{safe_path}', 'SEAFILE', {str(viewable).upper()}, NOW(), NOW())")
    
    # 最后一条或每 50 条添加分号
    if file_id_counter == len(paths) or file_id_counter % 50 == 0:
        sql_lines[-1] = sql_lines[-1] + ';'
        sql_lines.append('')
    
    file_id_counter += 1

sql_lines.append('-- =====================================================')
sql_lines.append('-- 验证数据')
sql_lines.append('-- =====================================================')
sql_lines.append('SELECT ')
sql_lines.append('    COUNT(*) AS total_files,')
sql_lines.append('    COUNT(CASE WHEN category = ''sales'' THEN 1 END) AS sales_files,')
sql_lines.append('    COUNT(CASE WHEN category = ''company'' THEN 1 END) AS company_files,')
sql_lines.append('    COUNT(CASE WHEN category = ''product'' THEN 1 END) AS product_files,')
sql_lines.append('    COUNT(CASE WHEN category = ''maintenance'' THEN 1 END) AS maintenance_files,')
sql_lines.append('    COUNT(CASE WHEN type = ''PDF'' THEN 1 END) AS pdf_files,')
sql_lines.append('    COUNT(CASE WHEN type = ''Video'' THEN 1 END) AS video_files,')
sql_lines.append('    COUNT(CASE WHEN type = ''Image'' THEN 1 END) AS image_files,')
sql_lines.append('    COUNT(CASE WHEN type = ''Excel'' THEN 1 END) AS excel_files,')
sql_lines.append('    COUNT(CASE WHEN type = ''PPT'' THEN 1 END) AS ppt_files')
sql_lines.append('FROM media_files;')
sql_lines.append('')
sql_lines.append("SELECT 'Media files initialization completed successfully!' AS message;")

# 写入文件
output_file = os.path.join(project_root, 'src', 'backend', 'cleaner-support-agent-backend', 
                          'src', 'main', 'resources', 'db', 'init_media_files_data.sql')
os.makedirs(os.path.dirname(output_file), exist_ok=True)

with open(output_file, 'w', encoding='utf-8') as f:
    f.write('\n'.join(sql_lines))

print(f'Generated SQL script with {file_id_counter - 1} files')
print(f'Output file: {output_file}')
