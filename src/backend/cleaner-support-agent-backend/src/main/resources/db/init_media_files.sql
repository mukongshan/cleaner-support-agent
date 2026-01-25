-- =====================================================
-- 媒体文件表初始化数据脚本
-- 根据 res/file_path.py 自动生成
-- 执行日期：2026-01-25
-- =====================================================

USE cleaner_support;

-- 清空现有数据（可选，首次初始化时使用）
TRUNCATE TABLE media_files;

SELECT * FROM media_files;


-- =====================================================
-- 插入媒体文件数据
-- =====================================================

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000001', '2025年公司简介（A4版）', 'PDF', 'sales', '/00-Sales Kit/02-Aventurier ｜ 2025 Company Profile_A4.pdf', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000002', 'A1 与人工清洁每日成本对比', 'PDF', 'sales', '/00-Sales Kit/11-Daily Cleaning Cost Comparison_ A1 vs Manual Laber.pdf', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000003', 'AVT iClean 应用用户指引', 'PDF', 'sales', '/00-Sales Kit/10-AVT iClean App User''s Guidance.pdf', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000004', 'Artist 1 HEPA 过滤器报告', 'PDF', 'product', '/02-Presale-Product/04-Product Certificate/05-HEPA certificate/HEPA filter report.pdf', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000005', 'Artist 1 Youth 图片 1', 'Image', 'product', '/02-Presale-Product/02-Artis1 1 Youth/02-Pictures & Photos/1.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000006', 'Artist 1 Youth 图片 2', 'Image', 'product', '/02-Presale-Product/02-Artis1 1 Youth/02-Pictures & Photos/2.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000007', 'Artist 1 Youth 图片 3', 'Image', 'product', '/02-Presale-Product/02-Artis1 1 Youth/02-Pictures & Photos/3.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000008', 'Artist 1 Youth 图片 4', 'Image', 'product', '/02-Presale-Product/02-Artis1 1 Youth/02-Pictures & Photos/4.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000009', 'Artist 1 Youth 图片 5', 'Image', 'product', '/02-Presale-Product/02-Artis1 1 Youth/02-Pictures & Photos/5.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000010', 'Artist 1 Youth 图片 6', 'Image', 'product', '/02-Presale-Product/02-Artis1 1 Youth/02-Pictures & Photos/6.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000011', 'Artist 1 Youth 控制手柄图', 'Image', 'product', '/02-Presale-Product/02-Artis1 1 Youth/02-Pictures & Photos/Control handle.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000012', 'Artist 1 Youth（白版）宣传册', 'PDF', 'product', '/02-Presale-Product/02-Artis1 1 Youth/01-Brochure/Artist 1 Youth-White version-CN.pdf', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000013', 'Artist 1 Youth（白版）宣传册（英文）', 'PDF', 'product', '/02-Presale-Product/02-Artis1 1 Youth/01-Brochure/Artist 1 Youth-White version-EN.pdf', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000014', 'Artist 1 产品开发历程图片', 'Image', 'product', '/02-Presale-Product/01-Product Material/03-Package/A1 development Journey.jpg', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000015', 'Artist 1 产品规格说明书（英文版）', 'PDF', 'sales', '/00-Sales Kit/05-Artist 1 Specification-EN.pdf', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000016', 'Artist 1 充电器证书 - 25NM04219', 'PDF', 'product', '/02-Presale-Product/04-Product Certificate/03-Charger certificate/25NM04219.pdf', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000017', 'Artist 1 充电器证书 - CE', 'PDF', 'product', '/02-Presale-Product/04-Product Certificate/03-Charger certificate/Battery charger- CE.pdf', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000018', 'Artist 1 充电器证书 - UL（8A）', 'PDF', 'product', '/02-Presale-Product/04-Product Certificate/03-Charger certificate/8A charger - UL.pdf', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000019', 'Artist 1 包装内容说明图', 'Image', 'product', '/02-Presale-Product/01-Product Material/03-Package/what‘s in the box.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000020', 'Artist 1 包装尺寸图', 'Image', 'product', '/02-Presale-Product/01-Product Material/03-Package/Package Size.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000021', 'Artist 1 参数对比表（Excel）', 'Excel', 'sales', '/00-Sales Kit/06-Artist 1 Parameter Comparison.xlsx', 'SEAFILE', FALSE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000022', 'Artist 1 宣传传单（英文版）', 'PDF', 'sales', '/00-Sales Kit/04-Artist 1 Flyer _EN.pdf', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000023', 'Artist 1 尺寸图', 'Image', 'product', '/02-Presale-Product/01-Product Material/03-Package/Size.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000024', 'Artist 1 快速使用指南（英文版）', 'PDF', 'sales', '/00-Sales Kit/09-Artist 1 Quick Guide-EN.pdf', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000025', 'Artist 1 折叠尺寸图', 'Image', 'product', '/02-Presale-Product/01-Product Material/03-Package/folded Size.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000026', 'Artist 1 机器保险 - 2024.06-2025.06', 'PDF', 'product', '/02-Presale-Product/04-Product Certificate/02-Machine certificate/Insurance for Artist 1-2024.06-2025.06.pdf', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000027', 'Artist 1 机器保险 - 2025.06-2026.06', 'PDF', 'product', '/02-Presale-Product/04-Product Certificate/02-Machine certificate/Insurance for Artist 1-2025.06-2026.06.pdf', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000028', 'Artist 1 机器证书 - CB', 'PDF', 'product', '/02-Presale-Product/04-Product Certificate/02-Machine certificate/03-CB certificate/CB certificate- Artist 1.pdf', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000029', 'Artist 1 机器证书 - CE EMC', 'PDF', 'product', '/02-Presale-Product/04-Product Certificate/02-Machine certificate/01-CE Certificate/CE-EMC.pdf', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000030', 'Artist 1 机器证书 - CE MD', 'PDF', 'product', '/02-Presale-Product/04-Product Certificate/02-Machine certificate/01-CE Certificate/CE-MD.pdf', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000031', 'Artist 1 机器证书 - CE RED', 'PDF', 'product', '/02-Presale-Product/04-Product Certificate/02-Machine certificate/01-CE Certificate/CE-RED.pdf', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000032', 'Artist 1 机器证书 - CE VOC 更新通知', 'PDF', 'product', '/02-Presale-Product/04-Product Certificate/02-Machine certificate/01-CE Certificate/Notification of CE VOC template update(1).pdf', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000033', 'Artist 1 机器证书 - CE 符合声明', 'PDF', 'product', '/02-Presale-Product/04-Product Certificate/02-Machine certificate/01-CE Certificate/CE declaration of conformity.pdf', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000034', 'Artist 1 机器证书 - IEC 60335-2-67 测试报告', 'PDF', 'product', '/02-Presale-Product/04-Product Certificate/02-Machine certificate/01-CE Certificate/TEST REPORT IEC 60335-2-67.pdf', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000035', 'Artist 1 机器证书 - NRTL', 'PDF', 'product', '/02-Presale-Product/04-Product Certificate/02-Machine certificate/04-NRTL/US-NRTL -Artist 1.pdf', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000036', 'Artist 1 机器证书 - UKCA', 'PDF', 'product', '/02-Presale-Product/04-Product Certificate/02-Machine certificate/02-UKCA/UKCA certificate.pdf', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000037', 'Artist 1 机器跌落测试 - 连接器测试 1', 'Video', 'product', '/02-Presale-Product/03-Product Quality Test/05-Machine drop test/Connector testing 1.mp4', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000038', 'Artist 1 机器跌落测试 - 连接器测试 2', 'Video', 'product', '/02-Presale-Product/03-Product Quality Test/05-Machine drop test/Connector testing 2.mp4', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000039', 'Artist 1 机器跌落测试 - 连接器测试 3', 'Video', 'product', '/02-Presale-Product/03-Product Quality Test/05-Machine drop test/Connector testing 3.mp4', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000040', 'Artist 1 消毒电解水测试报告', 'PDF', 'product', '/02-Presale-Product/04-Product Certificate/04-Sterilization certificate/SGS Test Report for Electrolyzed Water.pdf', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000041', 'Artist 1 消毒证书 1', 'PDF', 'product', '/02-Presale-Product/04-Product Certificate/04-Sterilization certificate/2022FM03264R01E.pdf', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000042', 'Artist 1 消毒证书 2', 'PDF', 'product', '/02-Presale-Product/04-Product Certificate/04-Sterilization certificate/2022FM03265R01E.pdf', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000043', 'Artist 1 消毒证书 3', 'PDF', 'product', '/02-Presale-Product/04-Product Certificate/04-Sterilization certificate/2022FM03266R01E.pdf', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000044', 'Artist 1 消毒证书 4', 'PDF', 'product', '/02-Presale-Product/04-Product Certificate/04-Sterilization certificate/2022FM03267R01E.pdf', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000045', 'Artist 1 生产质量管控流程视频', 'Video', 'product', '/02-Presale-Product/03-Product Quality Test/01-Artist 1 Production Quality Control Process.mp4', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000046', 'Artist 1 用户手册（英文版）', 'PDF', 'sales', '/00-Sales Kit/07-Artist 1 User Manual-EN.pdf', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000047', 'Artist 1 电池 MSDS - HBCDD & SCCP', 'PDF', 'product', '/02-Presale-Product/04-Product Certificate/01-Battery certificate/01-MSDS/03-Battery HBCDD SCCP.pdf', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000048', 'Artist 1 电池 MSDS - ROHS', 'PDF', 'product', '/02-Presale-Product/04-Product Certificate/01-Battery certificate/01-MSDS/02-Battery ROHS.pdf', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000049', 'Artist 1 电池 MSDS - SVHC', 'PDF', 'product', '/02-Presale-Product/04-Product Certificate/01-Battery certificate/01-MSDS/02-Battery SVHC.pdf', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000050', 'Artist 1 电池 MSDS - TSCA', 'PDF', 'product', '/02-Presale-Product/04-Product Certificate/01-Battery certificate/01-MSDS/03-Battery TSCA.pdf', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000051', 'Artist 1 电池 MSDS - 通用', 'PDF', 'product', '/02-Presale-Product/04-Product Certificate/01-Battery certificate/01-MSDS/01-General MSDS.pdf', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000052', 'Artist 1 电池 MSDS - 重金属含量', 'PDF', 'product', '/02-Presale-Product/04-Product Certificate/01-Battery certificate/01-MSDS/04-Battery Heavy Metals Content.pdf', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000053', 'Artist 1 电池介绍视频（波兰语）', 'Video', 'product', '/02-Presale-Product/03-Product Quality Test/04-Battery quality/Artist 1 Battery introduction-Polski/Artist 1 Battery introduction-Polski.mov', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000054', 'Artist 1 电池介绍视频（波兰语）MP4', 'Video', 'product', '/02-Presale-Product/03-Product Quality Test/04-Battery quality/Artist 1 Battery introduction-Polski/Artist 1 Battery introduction-Polski.mp4', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000055', 'Artist 1 电池介绍视频（波兰语）字幕', 'Article', 'product', '/02-Presale-Product/03-Product Quality Test/04-Battery quality/Artist 1 Battery introduction-Polski/Artist 1 Battery introduction-Polski.srt', 'SEAFILE', FALSE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000056', 'Artist 1 电池介绍视频（波兰语）音频', 'Article', 'product', '/02-Presale-Product/03-Product Quality Test/04-Battery quality/Artist 1 Battery introduction-Polski/Artist 1 Battery introduction-Polski.wav', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000057', 'Artist 1 电池证书 - CB', 'PDF', 'product', '/02-Presale-Product/04-Product Certificate/01-Battery certificate/03-CE+CB+FCC/Battery - CB.pdf', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000058', 'Artist 1 电池证书 - CE', 'PDF', 'product', '/02-Presale-Product/04-Product Certificate/01-Battery certificate/03-CE+CB+FCC/Battery - CE.pdf', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000059', 'Artist 1 电池证书 - FCC', 'PDF', 'product', '/02-Presale-Product/04-Product Certificate/01-Battery certificate/03-CE+CB+FCC/Battery - FCC.pdf', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000060', 'Artist 1 电池证书 - UN38.3', 'PDF', 'product', '/02-Presale-Product/04-Product Certificate/01-Battery certificate/04-UN38.3/UN38.3_PNS231107068 08001.pdf', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000061', 'Artist 1 电池运输证书 - 海运（灰色）', 'PDF', 'product', '/02-Presale-Product/04-Product Certificate/01-Battery certificate/02-Transport Certificate/Battery Transport Certificate-Sea Freight-2025-Grey.pdf', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000062', 'Artist 1 电池运输证书 - 海运（白色）', 'PDF', 'product', '/02-Presale-Product/04-Product Certificate/01-Battery certificate/02-Transport Certificate/Battery Transport Certificate-Sea Freight-2025-White.pdf', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000063', 'Artist 1 电池运输证书 - 空运（灰色）', 'PDF', 'product', '/02-Presale-Product/04-Product Certificate/01-Battery certificate/02-Transport Certificate/Battery Transport Certificate-Air Freight-2025-Grey.pdf', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000064', 'Artist 1 电池运输证书 - 空运（白色）', 'PDF', 'product', '/02-Presale-Product/04-Product Certificate/01-Battery certificate/02-Transport Certificate/Battery Transport Certificate-Air Freight-2025-White.pdf', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000065', 'Artist 1 真空电机安全测试视频', 'Video', 'product', '/02-Presale-Product/03-Product Quality Test/03-Vacuum motor safety test.mp4', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000066', 'Artist 1 维护视频 - 刷轴拆解 1（工具准备）', 'Video', 'maintenance', '/04-Technical Support/04-Maintenance Video/16 Brush Shaft/01-Tool Preparation.mp4', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000067', 'Artist 1 维护视频 - 刷轴拆解 2（拆解）', 'Video', 'maintenance', '/04-Technical Support/04-Maintenance Video/16 Brush Shaft/02-Disassembly.mp4', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000068', 'Artist 1 维护视频 - 刷轴拆解 3（更换）', 'Video', 'maintenance', '/04-Technical Support/04-Maintenance Video/16 Brush Shaft/03-Replacement.mp4', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000069', 'Artist 1 维护视频 - 按钮操作 1（工具准备）', 'Video', 'maintenance', '/04-Technical Support/04-Maintenance Video/12 PUSH button/01-Tool Preparation.mp4', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000070', 'Artist 1 维护视频 - 按钮操作 2（拆解）', 'Video', 'maintenance', '/04-Technical Support/04-Maintenance Video/12 PUSH button/02-Disassembly.mp4', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000071', 'Artist 1 维护视频 - 按钮操作 3（更换）', 'Video', 'maintenance', '/04-Technical Support/04-Maintenance Video/12 PUSH button/03-Replacement.mp4', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000072', 'Artist 1 维护视频 - 橡胶底座拆解 1（工具准备）', 'Video', 'maintenance', '/04-Technical Support/04-Maintenance Video/14 Splash Rubber Base/01-Tool Preparation.mp4', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000073', 'Artist 1 维护视频 - 橡胶底座拆解 2（拆解）', 'Video', 'maintenance', '/04-Technical Support/04-Maintenance Video/14 Splash Rubber Base/02-Disassembly.mp4', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000074', 'Artist 1 维护视频 - 橡胶底座拆解 3（更换）', 'Video', 'maintenance', '/04-Technical Support/04-Maintenance Video/14 Splash Rubber Base/03-Replacement.mp4', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000075', 'Artist 1 维护视频 - 污水箱按钮重置', 'Video', 'maintenance', '/04-Technical Support/04-Maintenance Video/13 Waste Water Tank Push button/How to reset Push button.mp4', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000076', 'Artist 1 维护视频 - 清水槽底座拆解 1（工具准备）', 'Video', 'maintenance', '/04-Technical Support/04-Maintenance Video/17 Clean Water Tank Base/01-Tool Preparation.mp4', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000077', 'Artist 1 维护视频 - 清水槽底座拆解 2（拆解）', 'Video', 'maintenance', '/04-Technical Support/04-Maintenance Video/17 Clean Water Tank Base/02-Disassembly.mp4', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000078', 'Artist 1 维护视频 - 清水槽底座拆解 3（更换）', 'Video', 'maintenance', '/04-Technical Support/04-Maintenance Video/17 Clean Water Tank Base/03-Replacement.mp4', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000079', 'Artist 1 维护视频 - 电池软件升级', 'Video', 'maintenance', '/04-Technical Support/04-Maintenance Video/18 Upgrade Battery software/Upgrade Battery software.mp4', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000080', 'Artist 1 维护视频 - 电磁阀拆解 1（工具准备）', 'Video', 'maintenance', '/04-Technical Support/04-Maintenance Video/15 Solenoid/01-Tool Preparation.mp4', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000081', 'Artist 1 维护视频 - 电磁阀拆解 2（拆解）', 'Video', 'maintenance', '/04-Technical Support/04-Maintenance Video/15 Solenoid/02-Disassembly.mp4', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000082', 'Artist 1 维护视频 - 电磁阀拆解 3（更换）', 'Video', 'maintenance', '/04-Technical Support/04-Maintenance Video/15 Solenoid/03-Replacement.mp4', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000083', 'Artist 1 贴纸定制 - 机器 01', 'Image', 'product', '/02-Presale-Product/05-Sticker Customization/Machine 01.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000084', 'Artist 1 贴纸定制 - 机器 02', 'Image', 'product', '/02-Presale-Product/05-Sticker Customization/Machine 02.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000085', 'Artist 1 贴纸定制 - 机器 03', 'Image', 'product', '/02-Presale-Product/05-Sticker Customization/Machine 03.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000086', 'Artist 1 贴纸定制 - 电池 01', 'Image', 'product', '/02-Presale-Product/05-Sticker Customization/Battery 01.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000087', 'Artist 1 贴纸定制 - 电池 01（1）', 'Image', 'product', '/02-Presale-Product/05-Sticker Customization/Battery 01 (1).png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000088', 'Artist 1 贴纸定制 - 电池 02', 'Image', 'product', '/02-Presale-Product/05-Sticker Customization/Battery 02.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000089', 'Artist 1 贴纸定制 - 电池 02（1）', 'Image', 'product', '/02-Presale-Product/05-Sticker Customization/Battery 02 (1).png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000090', 'Artist 1 越障测试视频', 'Video', 'product', '/02-Presale-Product/03-Product Quality Test/02-obstacle surmounting test.mp4', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000091', 'Artist 1 零部件手册（英文版）', 'PDF', 'sales', '/00-Sales Kit/08-A1 parts manual-EN.pdf', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000092', 'Artist 1（灰色版）APP界面 - 实时监控', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/01-Grey version/02-Parts & Accessories/08-APP/Real-Time Monitoring.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000093', 'Artist 1（灰色版）APP界面 - 报告', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/01-Grey version/02-Parts & Accessories/08-APP/Report.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000094', 'Artist 1（灰色版）不同充电器PNG图', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/01-Grey version/02-Parts & Accessories/02-Battery/different charger.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000095', 'Artist 1（灰色版）不同充电器对比图', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/01-Grey version/02-Parts & Accessories/02-Battery/different charger.jpg', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000096', 'Artist 1（灰色版）充电座&电池组合图', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/01-Grey version/02-Parts & Accessories/02-Battery/Charging Station& Battery.jpg', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000097', 'Artist 1（灰色版）充电座图片 1', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/01-Grey version/02-Parts & Accessories/02-Battery/Charging Station 1-1.jpg', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000098', 'Artist 1（灰色版）充电座图片 2', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/01-Grey version/02-Parts & Accessories/02-Battery/Charging Station 1-2.jpg', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000099', 'Artist 1（灰色版）充电座总图', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/01-Grey version/02-Parts & Accessories/02-Battery/Charging Station.jpg', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000100', 'Artist 1（灰色版）刮水器 - 灰色', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/01-Grey version/02-Parts & Accessories/06-Squeegee/Grey squeegee.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000101', 'Artist 1（灰色版）刮水器配件 - 万向轮', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/01-Grey version/02-Parts & Accessories/06-Squeegee/Swivel Caster - Universal Wheel of Squeegee.jpg', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000102', 'Artist 1（灰色版）刮水器配件 - 前视图', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/01-Grey version/02-Parts & Accessories/06-Squeegee/front.jpg', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000103', 'Artist 1（灰色版）刮水器配件 - 后视图', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/01-Grey version/02-Parts & Accessories/06-Squeegee/back.jpg', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000104', 'Artist 1（灰色版）刮水器配件 - 吸水管', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/01-Grey version/02-Parts & Accessories/06-Squeegee/Suction hose.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000105', 'Artist 1（灰色版）刮水器配件 - 溅水防护', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/01-Grey version/02-Parts & Accessories/06-Squeegee/Spash Guard.jpg', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000106', 'Artist 1（灰色版）刮水器配件 - 溅水防护 2', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/01-Grey version/02-Parts & Accessories/06-Squeegee/Spash Guard 2.jpg', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000107', 'Artist 1（灰色版）刷具家族图', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/01-Grey version/02-Parts & Accessories/03-Brush/Brush family.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000108', 'Artist 1（灰色版）屏幕 - 整体', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/01-Grey version/02-Parts & Accessories/07-Screen/Screen.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000109', 'Artist 1（灰色版）屏幕 - 特写', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/01-Grey version/02-Parts & Accessories/07-Screen/Screen-close-up.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000110', 'Artist 1（灰色版）替换刷具提示图', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/01-Grey version/02-Parts & Accessories/03-Brush/Replace brush.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000111', 'Artist 1（灰色版）机器实拍图 - 正面摆放', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/01-Grey version/01-Machine/02-Product_Live_Shot-PNG/stored_right side.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000112', 'Artist 1（灰色版）机器实拍图 - 行走状态左后角度', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/01-Grey version/01-Machine/02-Product_Live_Shot-PNG/walk status_left angled_back.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000113', 'Artist 1（灰色版）机器实拍图 - 行走状态左角度', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/01-Grey version/01-Machine/02-Product_Live_Shot-PNG/walk status_left angled.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000114', 'Artist 1（灰色版）橡胶条 - 耐撕裂蓝色', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/01-Grey version/02-Parts & Accessories/05-Rubber/Tear Resistant Blue Rubber Strip.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000115', 'Artist 1（灰色版）橡胶条 - 耐油红色', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/01-Grey version/02-Parts & Accessories/05-Rubber/Oil Resistant Red  Rubber Strip.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000116', 'Artist 1（灰色版）橡胶条 - 耐油通用', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/01-Grey version/02-Parts & Accessories/05-Rubber/Oil resistant Rubber.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000117', 'Artist 1（灰色版）污水箱图片 1', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/01-Grey version/02-Parts & Accessories/01-Tank/Waste Tank 2-1.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000118', 'Artist 1（灰色版）污水箱图片 2', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/01-Grey version/02-Parts & Accessories/01-Tank/Waste Tank 2-2.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000119', 'Artist 1（灰色版）污水箱图片 2变体', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/01-Grey version/02-Parts & Accessories/01-Tank/Waste Tank-2.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000120', 'Artist 1（灰色版）污水箱图片 3', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/01-Grey version/02-Parts & Accessories/01-Tank/Waste Tank 2-3.jpg', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000121', 'Artist 1（灰色版）污水箱图片 4', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/01-Grey version/02-Parts & Accessories/01-Tank/Waste Tank 2-4.jpg', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000122', 'Artist 1（灰色版）污水箱图片 5', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/01-Grey version/02-Parts & Accessories/01-Tank/Waste Tank 2-5.jpg', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000123', 'Artist 1（灰色版）污水箱总图', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/01-Grey version/02-Parts & Accessories/01-Tank/Waste Tank.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000124', 'Artist 1（灰色版）清水箱图片 1', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/01-Grey version/02-Parts & Accessories/01-Tank/Solution Tank 1-1.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000125', 'Artist 1（灰色版）清水箱图片 2', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/01-Grey version/02-Parts & Accessories/01-Tank/Solution Tank 1-2.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000126', 'Artist 1（灰色版）清水箱总图', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/01-Grey version/02-Parts & Accessories/01-Tank/Solution Tank.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000127', 'Artist 1（灰色版）清洁垫俯视图', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/01-Grey version/02-Parts & Accessories/04-Pad/Pad Horder-top view.jpg', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000128', 'Artist 1（灰色版）清洁垫其他角度', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/01-Grey version/02-Parts & Accessories/04-Pad/Pad horder (3).jpg', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000129', 'Artist 1（灰色版）清洁垫支架图', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/01-Grey version/02-Parts & Accessories/04-Pad/Pad holder.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000130', 'Artist 1（灰色版）清洁垫白色俯视图', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/01-Grey version/02-Parts & Accessories/04-Pad/white-top view.jpg', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000131', 'Artist 1（灰色版）清洁垫白色角度图 1', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/01-Grey version/02-Parts & Accessories/04-Pad/white-angled view.jpg', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000132', 'Artist 1（灰色版）清洁垫组件（Malemine等）', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/01-Grey version/02-Parts & Accessories/04-Pad/Malemine.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000133', 'Artist 1（灰色版）清洁垫角度图', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/01-Grey version/02-Parts & Accessories/04-Pad/Pad Horder-angled.jpg', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000134', 'Artist 1（灰色版）电池图片 1', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/01-Grey version/02-Parts & Accessories/02-Battery/Battery 2-1.jpg', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000135', 'Artist 1（灰色版）电池图片 2', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/01-Grey version/02-Parts & Accessories/02-Battery/Battery 2-2.jpg', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000136', 'Artist 1（灰色版）电池总图', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/01-Grey version/02-Parts & Accessories/02-Battery/Battery.jpg', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000137', 'Artist 1（灰色版）电源适配器图片 1', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/01-Grey version/02-Parts & Accessories/02-Battery/Power Adaptor 3-1.jpg', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000138', 'Artist 1（灰色版）电源适配器总图', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/01-Grey version/02-Parts & Accessories/02-Battery/Power Adaptor.jpg', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000139', 'Artist 1（灰色版）白色清洁垫 1', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/01-Grey version/02-Parts & Accessories/04-Pad/White Pads.jpg', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000140', 'Artist 1（灰色版）白色清洁垫 2', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/01-Grey version/02-Parts & Accessories/04-Pad/White Pads.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000141', 'Artist 1（灰色版）红色清洁垫', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/01-Grey version/02-Parts & Accessories/04-Pad/Red Pads.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000142', 'Artist 1（灰色版）红色盘刷', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/01-Grey version/02-Parts & Accessories/03-Brush/Red disk brush.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000143', 'Artist 1（灰色版）蓝色盘刷', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/01-Grey version/02-Parts & Accessories/03-Brush/Blue disk brush.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000144', 'Artist 1（灰色版）黑色清洁垫', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/01-Grey version/02-Parts & Accessories/04-Pad/Black pads.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000145', 'Artist 1（灰色版）黑色盘刷', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/01-Grey version/02-Parts & Accessories/03-Brush/Black disk brush.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000146', 'Artist 1（白色版）机器图片 - 侧视工作状态', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/02-White Version/01-Machine/Work Status side view.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000147', 'Artist 1（白色版）机器图片 - 屏幕', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/02-White Version/01-Machine/screen.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000148', 'Artist 1（白色版）机器图片 - 屏幕 1', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/02-White Version/01-Machine/srceen 1.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000149', 'Artist 1（白色版）机器图片 - 工作状态 10', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/02-White Version/01-Machine/work status 10.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000150', 'Artist 1（白色版）机器图片 - 工作状态 2', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/02-White Version/01-Machine/Work status 2.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000151', 'Artist 1（白色版）机器图片 - 工作状态 3', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/02-White Version/01-Machine/work status 3.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000152', 'Artist 1（白色版）机器图片 - 工作状态 4', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/02-White Version/01-Machine/work status 4.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000153', 'Artist 1（白色版）机器图片 - 工作状态 5', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/02-White Version/01-Machine/work status 5.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000154', 'Artist 1（白色版）机器图片 - 工作状态 6', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/02-White Version/01-Machine/work status 6.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000155', 'Artist 1（白色版）机器图片 - 工作状态 7', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/02-White Version/01-Machine/work status 7.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000156', 'Artist 1（白色版）机器图片 - 工作状态 8', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/02-White Version/01-Machine/work status 8.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000157', 'Artist 1（白色版）机器图片 - 工作状态 9', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/02-White Version/01-Machine/work status 9.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000158', 'Artist 1（白色版）机器图片 - 折叠状态', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/02-White Version/01-Machine/Collapsed Machine 2.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000159', 'Artist 1（白色版）机器图片 - 爆炸图', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/02-White Version/01-Machine/Exploded View.gif', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000160', 'Artist 1（白色版）机器图片 1', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/02-White Version/01-Machine/1.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000161', 'Artist 1（白色版）机器图片 2', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/02-White Version/01-Machine/2.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000162', 'Artist 1（白色版）机器图片 3', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/02-White Version/01-Machine/3.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000163', 'Artist 1（白色版）配件 - 底部图片', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/02-White Version/02-Parts & Accessories/bottom.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000164', 'Artist 1（白色版）配件 - 底部图片 1', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/02-White Version/02-Parts & Accessories/bottom 1.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000165', 'Artist 1（白色版）配件 - 污水箱', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/02-White Version/02-Parts & Accessories/Waste Tank.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000166', 'Artist 1（白色版）配件 - 清水箱 1', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/02-White Version/02-Parts & Accessories/Solution Tank1.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000167', 'Artist 1（白色版）配件 - 清水箱 2', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/02-White Version/02-Parts & Accessories/Solution Tank2.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000168', 'Artist 1（白色版）配件 - 电池', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/02-White Version/02-Parts & Accessories/Battery.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000169', 'Artist 1（白色版）配件图片 - DSC00508', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/02-White Version/02-Parts & Accessories/DSC00508.jpg', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000170', 'Artist 1（白色版）配件图片 - DSC00513', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/02-White Version/02-Parts & Accessories/DSC00513.jpg', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000171', 'Artist 1（白色版）配件图片 - DSC00524', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/02-White Version/02-Parts & Accessories/DSC00524.jpg', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000172', 'Artist 1（白色版）配件图片 1', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/02-White Version/02-Parts & Accessories/1.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000173', 'Artist 1（白色版）配件图片 2', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/02-White Version/02-Parts & Accessories/2.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000174', 'Artist 1（白色版）配件图片 3', 'Image', 'product', '/02-Presale-Product/01-Product Material/01-Artist 1 Pro & SE/03-Pictures& Photos/02-White Version/02-Parts & Accessories/3.png', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000175', '产品售前培训演示文稿', 'PPT', 'sales', '/00-Sales Kit/01-Product PreSale Training.pptx', 'SEAFILE', FALSE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000176', '工厂入口实拍视频', 'Video', 'company', '/01-Presale-Company/Factory/Factory_Entrance_View.MP4', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000177', '市场竞争分析报告', 'PDF', 'sales', '/00-Sales Kit/00-Competitors in the market.pdf', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000178', '常见问题解答（英文）', 'Excel', 'sales', '/00-Sales Kit/03-FAQ-EN.xlsx', 'SEAFILE', FALSE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000179', '机器测试区域图片', 'Image', 'company', '/01-Presale-Company/Factory/Machine_Testing_Area.jpg', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000180', '生产线图片 01', 'Image', 'company', '/01-Presale-Company/Factory/Production Line-01.JPG', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000181', '生产线图片 02', 'Image', 'company', '/01-Presale-Company/Factory/Production Line-02.JPG', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000182', '生产线图片 03', 'Image', 'company', '/01-Presale-Company/Factory/Production Line-03.JPG', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000183', '生产线展示视频', 'Video', 'company', '/01-Presale-Company/Factory/Production Line.MP4', 'SEAFILE', TRUE, NOW(), NOW());

INSERT INTO media_files (file_id, title, type, category, seafile_path, access_method, is_viewable, created_at, updated_at) VALUES
    ('KB000184', '竞争对手分析演示文稿', 'PPT', 'sales', '/00-Sales Kit/00-Competitors in the market.pptx', 'SEAFILE', FALSE, NOW(), NOW());

-- =====================================================
-- 验证数据
-- =====================================================
SELECT
    COUNT(*) AS total_files,
    COUNT(CASE WHEN category = sales THEN 1 END) AS sales_files,
    COUNT(CASE WHEN category = company THEN 1 END) AS company_files,
    COUNT(CASE WHEN category = product THEN 1 END) AS product_files,
    COUNT(CASE WHEN category = maintenance THEN 1 END) AS maintenance_files,
    COUNT(CASE WHEN type = PDF THEN 1 END) AS pdf_files,
    COUNT(CASE WHEN type = Video THEN 1 END) AS video_files,
    COUNT(CASE WHEN type = Image THEN 1 END) AS image_files,
    COUNT(CASE WHEN type = Excel THEN 1 END) AS excel_files,
    COUNT(CASE WHEN type = PPT THEN 1 END) AS ppt_files
FROM media_files;

SELECT 'Media files initialization completed successfully!' AS message;